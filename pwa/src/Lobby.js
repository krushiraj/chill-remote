import React from 'react';

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slotId: '',
    };
  }
  render() {
    return (
      <div className="flex flex-col m-auto">
        <h1 className="mb-6 pt-6 mx-auto text-center">Enter Slot ID here</h1>
        <div className="flex flex-col items-center mr-4 mb-4">
          <input
            className="mx-auto shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="slotid"
            type="text"
            placeholder="Room ID"
            value={this.state.slotId}
            onChange={(e) => this.setState({ slotId: e.target.value })}
          />
          <button
            className="flex align-middle bg-white-500 hover:bg-white-700 text-black font-bold border-2 py-1 px-4 mx-auto my-2 rounded"
            onClick={() => this.props.joinSlot(this.state.slotId)}
          >
            Connect
          </button>
        </div>
      </div>
    );
  }
}
