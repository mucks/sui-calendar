module sui_calendar::calendar {

    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    fun init(_ctx: &mut TxContext) {


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

    public fun create_calendar(title_bytes: vector<u8>, ctx: &mut TxContext) {
        let calendar = Calendar {
            id: object::new(ctx),
            title: string::utf8(title_bytes),
            events: vector::empty()
        };
        transfer::transfer(calendar, tx_context::sender(ctx));
    }


    #[test]
    public fun test_create_calendar() {
        use sui::tx_context;

        let ctx = tx_context::dummy();
        let title_bytes = vector::empty<u8>();
        create_calendar(title_bytes, &mut ctx);

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