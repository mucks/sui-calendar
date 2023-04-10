module sui_calendar::calendar {
    
    //use std::option::{Self, Option};

    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::debug;

    // error codes
    const ERR_NOT_AUTHORIZED: u64 = 401;
    const ERR_ALREADY_SHARED: u64 = 500;


    fun init(ctx: &mut TxContext) {
        let statistics = Statistics {
            id: object::new(ctx),
            calendar_count: 0,
            event_count: 0,
        };

        // make the statistics object shared so that it can be mutated by all transactions that have access to it
        transfer::share_object(statistics);

    }

    struct Statistics has key, store {
        id: UID,
        calendar_count: u64,
        event_count: u64,
    }

    struct Calendar has key {
        id: UID,
        creator: address,
        title: String,
        events_created: u64,
        events: vector<CalendarEvent>,
        shared_with: vector<address>,
    }


    struct CalendarEvent has store, drop, copy {
        id: u64,
        calendar_id: ID,
        title: String,
        start_timestamp: u64,
        end_timestamp: u64,
    }

    public fun debug_print_message(debug_input: vector<u8>) {
        let s: std::string::String = std::string::utf8(debug_input);
        debug::print(&s);
    }

    public entry fun create_calendar(stats: &mut Statistics, title_bytes: vector<u8>, ctx: &mut TxContext) {

        let sender = tx_context::sender(ctx);

        let calendar = Calendar {
            id: object::new(ctx),
            title: string::utf8(title_bytes),
            creator: sender,
            events_created: 0,
            events: vector::empty(),
            shared_with: vector::empty(),
        };

        transfer::share_object(calendar);
        
        stats.calendar_count = stats.calendar_count + 1;
        
    }

    // since the calendar object can be shared with other wallets, we need this creator check for some functions
    fun require_creator(calendar: &Calendar, sender: address) {
        if (sender != calendar.creator) {
            abort ERR_NOT_AUTHORIZED
        };
    }

    fun require_share(calendar: &Calendar, sender: address) {
        if (sender != calendar.creator) {
            let (found, _) = vector::index_of(&calendar.shared_with, &sender);
            if (!found) {
                abort ERR_NOT_AUTHORIZED
            };
        };
    }

    public entry fun share_calendar(calendar: &mut Calendar, addr: address, ctx: &mut TxContext) {
        require_creator(calendar, tx_context::sender(ctx));

        if (vector::contains(&calendar.shared_with, &addr)) {
            abort ERR_ALREADY_SHARED
        };

        vector::push_back(&mut calendar.shared_with, addr);

        //debug::print(&b"sharing calendar");

    }

    public entry fun unshare_calendar(calendar: &mut Calendar, addr: address, ctx: &mut TxContext) {
        require_creator(calendar, tx_context::sender(ctx));

        let (found, share_index) = vector::index_of(&calendar.shared_with, &addr);

        if (!found) {
            abort ERR_NOT_AUTHORIZED
        };

        vector::remove(&mut calendar.shared_with, share_index);
    }



    // TODO: currently it's for some reason not allowed to delete shared objects
    public entry fun delete_calendar(stats: &mut Statistics, calendar: Calendar, ctx: &mut TxContext) {
        require_creator(&calendar, tx_context::sender(ctx));

        let event_count = vector::length(&mut calendar.events);
        let Calendar { id, title: _, events: _, events_created: _, shared_with: _ , creator: _ } = calendar;
        object::delete(id);

        stats.event_count = stats.event_count - event_count;
        stats.calendar_count = stats.calendar_count - 1;
    }



    public entry fun create_calendar_event(stats: &mut Statistics, calendar: &mut Calendar, title_bytes: vector<u8>, start_timestamp: u64, end_timestamp: u64, ctx: &mut TxContext) {
        require_share(calendar, tx_context::sender(ctx));

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

    public fun delete_calendar_event(stats: &mut Statistics, calendar: &mut Calendar, event_id: u64, ctx: &mut TxContext) {
        require_share(calendar, tx_context::sender(ctx));
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
        let user = @0x1234;

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

        debug_print_message(b"create event ...");

        // create event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            
            create_calendar_event(&mut stats, &mut calendar, title_bytes, 0, 0, test_scenario::ctx(&mut scenario));
            create_calendar_event(&mut stats, &mut calendar, title_bytes, 0, 0, test_scenario::ctx(&mut scenario));

            test_scenario::return_shared(stats);
            test_scenario::return_shared(calendar);
        };
        
        debug_print_message(b"... created event");


        // check event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            assert!(vector::length(&mut calendar.events) == 2, 0);
            assert!(stats.event_count == 2, 0);
            test_scenario::return_shared(stats);
            test_scenario::return_shared(calendar);
        };

        // delete event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            let event = *vector::borrow(&mut calendar.events, 0);
            delete_calendar_event(&mut stats, &mut calendar, event.id, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(stats);
            test_scenario::return_shared(calendar);
        };

        // check event
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            assert!(vector::length(&mut calendar.events) == 1, 0);
            assert!(stats.event_count == 1, 0);
            test_scenario::return_shared(stats);
            test_scenario::return_shared(calendar);
        };
        
        debug_print_message(b"delete calendar ...");

        // delete calendar
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            delete_calendar(&mut stats, calendar, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(stats);
        };
        
        debug_print_message(b"... deleted calendar");
        
        debug_print_message(b"check calendar count");

        // check calendar count
        test_scenario::next_tx(&mut scenario, admin);
        {
            debug_print_message(b"start check calendar count");
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            debug::print(&stats);
            assert!(stats.calendar_count == 0, 0);
            assert!(stats.event_count == 0, 0);
            test_scenario::return_shared(stats);
        };
        
        debug_print_message(b"... checked calendar count");
        
        debug_print_message(b"create another calendar");

        // create calendar and share it with user
        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_shared<Statistics>(&mut scenario);
            create_calendar(&mut stats, title_bytes, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(stats);
        };
        
        debug_print_message(b"share calendar ...");

        // share that calendar
        test_scenario::next_tx(&mut scenario, admin);
        {
            let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
            share_calendar(&mut calendar, user, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(calendar);
        };
        
        debug_print_message(b"... shared calendar");
        


        // test_scenario::next_tx(&mut scenario, user);
        // {
        //     let calendar = test_scenario::take_shared<Calendar>(&mut scenario);
        //     assert!(vector::borrow(&mut calendar.shared_with, 0) == &user, 0);
        //     test_scenario::return_shared(calendar);
        // };
        
        test_scenario::end(scenario);

    }



}