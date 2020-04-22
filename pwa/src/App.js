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
                // this.getControls()
                <div id="controls" className="flex flex-col">
                  <div className="flex">
                    <div className="w-1/3">
                      <button>
                        <svg
                          height="100%"
                          version="1.1"
                          viewBox="0 0 36 36"
                          width="100%"
                        >
                          <path
                            className="ytp-svg-fill"
                            d="m 12,12 h 2 v 12 h -2 z m 3.5,6 8.5,6 V 12 z"
                            id="ytp-id-13"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div className="w-1/3">
                      <button>
                        <svg
                          height="100%"
                          version="1.1"
                          viewBox="0 0 36 36"
                          width="100%"
                        >
                          <path
                            className="ytp-svg-fill"
                            d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"
                            id="ytp-id-74"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div className="w-1/3">
                      <button>
                        <svg
                          height="100%"
                          version="1.1"
                          viewBox="0 0 36 36"
                          width="100%"
                        >
                          <path
                            className="ytp-svg-fill"
                            d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"
                            id="ytp-id-15"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/6">
                      <button>
                        <svg
                          height="100%"
                          version="1.1"
                          viewBox="0 0 36 36"
                          width="100%"
                        >
                          <path
                            d="m 26,13 0,10 -16,0 0,-10 z m -14,2 12,0 0,6 -12,0 0,-6 z"
                            fill="#000"
                            fillRule="evenodd"
                            id="ytp-id-34"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div className="w-1/6">
                      <button>
                        <svg
                          height="100%"
                          version="1.1"
                          viewBox="0 0 36 36"
                          width="100%"
                        >
                          <g className="ytp-fullscreen-button-corner-0">
                            <path
                              className="ytp-svg-fill"
                              d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"
                              id="ytp-id-27"
                            ></path>
                          </g>
                          <g className="ytp-fullscreen-button-corner-1">
                            <path
                              className="ytp-svg-fill"
                              d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"
                              id="ytp-id-28"
                            ></path>
                          </g>
                          <g className="ytp-fullscreen-button-corner-2">
                            <path
                              className="ytp-svg-fill"
                              d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"
                              id="ytp-id-29"
                            ></path>
                          </g>
                          <g className="ytp-fullscreen-button-corner-3">
                            <path
                              className="ytp-svg-fill"
                              d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"
                              id="ytp-id-30"
                            ></path>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/6">
                      <button>
                        <svg
                          viewBox="0 0 24 24"
                          preserveAspectRatio="xMidYMid meet"
                          focusable="false"
                          className="style-scope yt-icon"
                          style={{
                            pointerEvents: 'none',
                            display: 'block',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <g className="style-scope yt-icon">
                            <path
                              d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"
                              className="style-scope yt-icon"
                            ></path>
                          </g>
                        </svg>
                      </button>
                    </div>
                    <div className="w-1/6">
                      <button>
                        <svg
                          viewBox="0 0 24 24"
                          preserveAspectRatio="xMidYMid meet"
                          focusable="false"
                          className="style-scope yt-icon"
                          style={{
                            pointerEvents: 'none',
                            display: 'block',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <g className="style-scope yt-icon">
                            <path
                              d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"
                              className="style-scope yt-icon"
                            ></path>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
