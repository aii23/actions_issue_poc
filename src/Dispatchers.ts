import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Reducer,
  Provable,
} from 'o1js';

export class OneFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Field });

  @method async dispatch() {
    this.reducer.dispatch(Field(0));
  }
}

export class ThreeFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Provable.Array(Field, 3) });

  @method async dispatch() {
    this.reducer.dispatch(Array(3).map((x) => Field(0)));
  }
}

export class TenFieldActionDispatcher extends SmartContract {
  reducer = Reducer({ actionType: Provable.Array(Field, 10) });

  @method async dispatch() {
    this.reducer.dispatch(Array(10).map((x) => Field(0)));
  }
}
