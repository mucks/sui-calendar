module sui_calendar::calendar {

    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::debug;


    fun init(ctx: &mut TxContext) {
        let statistics = Statistics {
            id: object::new(ctx),
            calendar_count: 0,
            event_count: 0,
        };

        // make the statistics object shared so that it can be mutated by all transactions that have access to it
        transfer::share_object(statistics);
        // transfer::transfer(statistics, tx_context::sender(ctx));

    }

    struct Statistics has key, store {
        id: UID,
        calendar_count: u64,
        event_count: u64,
    }

    struct Calendar has key {
        id: UID,
        title: String,
        events_created: u64,
        events: vector<CalendarEvent>,
    }

    struct CalendarEvent has store, drop, copy {
        id: u64,
        calendar_id: ID,
        title: String,
        start_timestamp: u64,
        end_timestamp: u64,
    }

    public fun calendar_title(self: &Calendar): String {
        self.title
    }

    public fun debug_print_message(debug_input: vector<u8>) {
        let s: std::string::String = std::string::utf8(debug_input);
        debug::print(&s);
    }

    public entry fun create_calendar(stats: &mut Statistics, title_bytes: vector<u8>, ctx: &mut TxContext) {
        let calendar = Calendar {
            id: object::new(ctx),
            title: string::utf8(title_bytes),
            events_created: 0,
            events: vector::empty()
        };

        transfer::transfer(calendar, tx_context::sender(ctx));
        
        stats.calendar_count = stats.calendar_count + 1;
        
    }

    public entry fun delete_calendar(stats: &mut Statistics, calendar: Calendar) {
        let event_count = vector::length(&mut calendar.events);

        let Calendar { id, title: _, events: _, events_created: _ } = calendar;
        object::delete(id);

        stats.event_count = stats.event_count - event_count;
        stats.calendar_count = stats.calendar_count - 1;
    }



    public entry fun create_calendar_event(stats: &mut Statistics, calendar: &mut Calendar, title_bytes: vector<u8>, start_timestamp: u64, end_timestamp: u64, _ctx: &mut TxContext) {
        let calendar_id = object::id(calendar);

        let event = CalendarEvent {
            id: calendar.events_created,
            calendar_id: calendar_id,
            title: string::utf8(title_bytes),
            start_timestamp: start_timestamp,
            end_timestamp: end_timestamp,
        };

        vector::push_back(&mut calendar.events, event);

        calendar.events_created = calendar.events_created + 1;
        stats.event_count = stats.event_count + 1;
    }

    fun index_of_id(events: &mut vector<CalendarEvent>, id: u64): (bool, u64) {
        let found = false;
        let index = 0;
        let i = 0;
        while (i < vector::length(events)) {
            let event = *vector::borrow(events, i);
            if (event.id == id) {
                found = true;
                index = i;
                break
            };
            i = i + 1;
        };
        (found, index)
    }

    public fun delete_calendar_event(stats: &mut Statistics, calendar: &mut Calendar, event_id: u64) {
        let (found, index) = index_of_id(&mut calendar.events, event_id);

        if (found) {
            vector::remove(&mut calendar.events, index);
            stats.event_count = stats.event_count - 1;
        }
    }
    
    #[test]
    public fun test_calendar() {
        use sui::test_scenario;

        let title_bytes = vector::empty<u8>();
        
        let admin = @0xABBA;

        let scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin); 
        {
            init(test_scenario::ctx(&mut scenario));
        };


        // create calendar
        test_scenario::next_tx(&mut scenario, admin);
        {

            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            create_calendar(&mut stats, title_bytes, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(stats);
        };

        // check calendar count
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            assert!(stats.calendar_count == 1, 0);
            test_scenario::return_shared(stats);
        };

        // create event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_from_sender<Calendar>(&mut scenario);
            
            create_calendar_event(&mut stats, &mut calendar, title_bytes, 0, 0, test_scenario::ctx(&mut scenario));
            create_calendar_event(&mut stats, &mut calendar, title_bytes, 0, 0, test_scenario::ctx(&mut scenario));

            test_scenario::return_shared(stats);
            test_scenario::return_to_sender(&mut scenario, calendar);
        };

        // check event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_from_sender<Calendar>(&mut scenario);
            assert!(vector::length(&mut calendar.events) == 2, 0);
            assert!(stats.event_count == 2, 0);
            test_scenario::return_shared(stats);
            test_scenario::return_to_sender(&mut scenario, calendar);
        };

        // delete event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_from_sender<Calendar>(&mut scenario);
            let event = *vector::borrow(&mut calendar.events, 0);
            delete_calendar_event(&mut stats, &mut calendar, event.id);
            test_scenario::return_shared(stats);
            test_scenario::return_to_sender(&mut scenario, calendar);
        };

        // check event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_from_sender<Calendar>(&mut scenario);
            assert!(vector::length(&mut calendar.events) == 1, 0);
            assert!(stats.event_count == 1, 0);
            test_scenario::return_shared(stats);
            test_scenario::return_to_sender(&mut scenario, calendar);
        };

        // delete calendar
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_from_sender<Calendar>(&mut scenario);
            delete_calendar(&mut stats, calendar);
            test_scenario::return_shared(stats);
        };

        // check calendar count
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            assert!(stats.calendar_count == 0, 0);
            assert!(stats.event_count == 0, 0);
            test_scenario::return_shared(stats);
        };
        
        test_scenario::end(scenario);

    }



}