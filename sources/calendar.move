module sui_calendar::calendar {

    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};


    fun init(ctx: &mut TxContext) {
        let statistics = Statistics {
            id: object::new(ctx),
            calendar_count: 0,
            event_count: 0,
        };

        transfer::transfer(statistics, tx_context::sender(ctx));

    }

    struct Statistics has key, store {
        id: UID,
        calendar_count: u64,
        event_count: u64,
    }

    struct Calendar has key {
        id: UID,
        title: String,
        events: vector<Event>,
    }

    struct Event has key, store {
        id: UID,
        calendar: address,
        name: String,
        start_timestamp: u64,
        end_timestamp: u64,
    }

    public fun calendar_title(self: &Calendar): String {
        self.title
    }

    public entry fun create_calendar(stats: &mut Statistics, title_bytes: vector<u8>, ctx: &mut TxContext) {
        let calendar = Calendar {
            id: object::new(ctx),
            title: string::utf8(title_bytes),
            events: vector::empty()
        };

        stats.calendar_count = stats.calendar_count + 1;

        transfer::transfer(calendar, tx_context::sender(ctx));
    }


    #[test]
    public fun test_create_calendar() {
        use sui::tx_context;
        use sui::test_scenario;

        let ctx = tx_context::dummy();
        let title_bytes = vector::empty<u8>();
        
        let admin = @0xABBA;

        let scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin); 
        {
            init(test_scenario::ctx(&mut scenario));
        };


        test_scenario::next_tx(&mut scenario, admin);
        {

            let stats = test_scenario::take_from_sender<Statistics>(&mut scenario);
            create_calendar(&mut stats, title_bytes, &mut ctx);
            test_scenario::return_to_sender(&mut scenario, stats);
        };


        test_scenario::next_tx(&mut scenario, admin);
        {
            let stats = test_scenario::take_from_sender<Statistics>(&mut scenario);
            assert!(stats.calendar_count == 1, 0);
            test_scenario::return_to_sender(&mut scenario, stats);
        };
        
        test_scenario::end(scenario);

    }

    public fun create_event(calendar: address, name_bytes: vector<u8>, start_timestamp: u64, end_timestamp: u64, ctx: &mut TxContext) {
        let event = Event {
            id: object::new(ctx),
            calendar: calendar,
            name: string::utf8(name_bytes),
            start_timestamp: start_timestamp,
            end_timestamp: end_timestamp,
        };
        transfer::transfer(event, calendar);
    }

    public fun delete_event(event: Event) {
        let Event { id, calendar: _, name: _, start_timestamp: _, end_timestamp: _ } = event;
        object::delete(id);
    }



}