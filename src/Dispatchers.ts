import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Reducer,
  Provable,
  Struct,
  UInt32,
  PublicKey,
  UInt64,
} from 'o1js';

export class OneFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Field });

  @method async dispatch() {
    this.reducer.dispatch(Field(1));
  }
}

export class ThreeFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Provable.Array(Field, 3) });

  @method async dispatch() {
    this.reducer.dispatch([...Array(3)].map((x) => Field(1)));
  }
}

export class TenFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Provable.Array(Field, 10) });

  @method async dispatch() {
    this.reducer.dispatch([...Array(10)].map((x) => Field(1)));
  }
}

const NUMBERS_IN_TICKET = 8;

export class Ticket extends Struct({
  numbers: Provable.Array(UInt32, NUMBERS_IN_TICKET),
}) {
  static from(numbers: number[]): Ticket {
    if (numbers.length != NUMBERS_IN_TICKET) {
      throw new Error(
        `Wrong amount of numbers. Got: ${numbers.length}, expect: ${NUMBERS_IN_TICKET}`
      );
    }
    return new Ticket({
      numbers: numbers.map((number) => UInt32.from(number)),
    });
  }
}

// export class StructActionDispatcher extends SmartContract {
//   reducer = Reducer({ actionType: Ticket });

//   @method async dispatch() {
//     this.reducer.dispatch(Ticket.from([1, 2, 3, 4, 5, 6, 7, 8]));
//   }
// }

// export class Ticket2 extends Struct({
//   owner: PublicKey,
//   amount: UInt64,
// }) {
//   static from(owner: PublicKey, amount: number): Ticket2 {
//     return new Ticket2({
//       owner,
//       amount: UInt64.from(amount),
//     });
//   }
// }

export class Ticket2 extends Struct({
  v1: PublicKey,
}) {
  static from(v1: PublicKey): Ticket2 {
    return new Ticket2({
      v1,
    });
  }
}

export class StructActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Ticket2 });

  @method async dispatch() {
    let address = this.sender.getAndRequireSignature();

    this.reducer.dispatch(Ticket2.from(address));
  }
}
