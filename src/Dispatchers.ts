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

export class AddressStruct extends Struct({
  v1: PublicKey,
}) {
  static from(v1: PublicKey): AddressStruct {
    return new AddressStruct({
      v1,
    });
  }
}

export class BrokenStructActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: AddressStruct });

  @method async dispatch() {
    let address = this.sender.getAndRequireSignature();

    this.reducer.dispatch(AddressStruct.from(address));
  }
}

export class ValidStructActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: AddressStruct });

  @method async dispatch() {
    let address = PublicKey.fromBase58(
      'B62qj3DYVUCaTrDnFXkJW34xHUBr9zUorg72pYN3BJTGB4KFdpYjxxQ'
    );

    this.reducer.dispatch(AddressStruct.from(address));
  }
}
