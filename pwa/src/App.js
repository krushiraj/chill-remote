import React from 'react';
import Cookie from './cookies';
import firebase, { firebaseApp } from './utils/firebase';
import Lobby from './Lobby';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.cookie = new Cookie();
    this.state = {
      ...this.cookie.getAll(),
    };
    this.db = firebaseApp.database().ref();
    this.slots = this.db.child('slots');
    this.controls = this.db.child('controls');
    this.connection = this.db.child('.info').child('connected');
  }

  async getSlotData() {
    const { slotId } = this.state;
    if (slotId) {
      const slotData = (await this.slots.child(slotId).once('value')).val();
      const controls = (await this.controls.once('value')).val();
      this.setState({ slotData, controls });
    }
  }

  componentDidMount() {
    const { slotId } = this.state;
    if (slotId) {
      this.getSlotData();

      this.connection.on('value', (snap) => {
        const val = snap.val();
        console.log('Connection:', { val });
        this.setTimestamp(val);
      });

      this.slots.child(slotId).on('value', (snap) => {
        const val = snap.val();
        console.log('Slot data update:', { val });

        this.setState({ slotData: val });
      });

      this.controls.on('value', (snap) => {
        const val = snap.val();
        console.log('Controls update:', { val });

        this.setState({ controls: val });
      });
    }
  }

  setTimestamp(appConn) {
    const { slotId } = this.state;
    if (slotId) {
      this.slots.child(slotId).update({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        appConn,
      });
    }
  }

  joinSlot(slotId) {
    this.slots.child(slotId).child('appConn').set(true);
    this.setTimestamp(true);
    this.cookie.set('slotId', slotId);
    this.setState({ slotId });
  }

  connectToChannel(tabId) {
    this.setState({
      currentChannel: {
        ...this.state.slotData.currentState[tabId],
        domain: this.getDomain(this.state.slotData.currentState[tabId].url),
        tabId,
      },
    });
  }

  getChannels() {
    const { currentState } = this.state.slotData;
    if (currentState) {
      const channels = Object.keys(currentState).map((tabId) => [
        tabId,
        currentState[tabId].url,
        currentState[tabId].title,
        currentState[tabId].favIconUrl,
        currentState[tabId].active,
      ]);
      console.log({ currentState, channels });
      return (
        <ul>
          {channels.map((channelData, key) => (
            <li key={key}>
              <span>{channelData[1]}</span>
              <button
                tabid={channelData[0]}
                onClick={(e) =>
                  this.connectToChannel(e.currentTarget.getAttribute('tabid'))
                }
              >
                Connect
              </button>
            </li>
          ))}
        </ul>
      );
    }
    return <p>No channels available</p>;
  }

  getDomain(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.hostname.replace(/(www.)|(.com)|(.in)|(.co)/g, '');
  }

  sendOperation(e) {
    const action = e.currentTarget.getAttribute('action');
    const control = e.currentTarget.getAttribute('control');
    const domain = e.currentTarget.getAttribute('domain');
    const tabId = e.currentTarget.getAttribute('tabid');
    this.slots.child(this.state.slotId).child('operation').set({
      action,
      control,
      domain,
      tabId,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  getControls() {
    const { url, tabId } = this.state.currentChannel;
    const domain = this.getDomain(url);
    const controls = this.state.controls[domain];
    return (
      <div className="flex flex-col">
        {Object.keys(controls).map((name, key) => {
          switch (controls[name]) {
            case 'button':
              return (
                <button
                  className="m-auto my-2 p-2 px-6 flex items-center justify-center bg-bluue-100 hover:bg-blue-300 text-black font-bold border-4 border-blue-500 rounded-md"
                  key={key}
                  action="click"
                  control={name}
                  domain={domain}
                  tabid={tabId}
                  onClick={(e) => this.sendOperation(e)}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              );
            default:
              return <React.Fragment></React.Fragment>;
          }
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="w-screen h-screen flex flex-col p-0 m-0">
        {this.state.slotId ? (
          <div id="cahnnels" className="flex m-auto">
            {this.state.slotData ? (
              this.state.currentChannel ? (
                this.getControls()
              ) : (
                this.getChannels()
              )
            ) : (
              <div></div>
            )}
          </div>
        ) : (
          <Lobby err={this.state.err} joinSlot={this.joinSlot.bind(this)} />
        )}
      </div>
    );
  }
}

export default App;
