import signalr from 'react-native-signalr';
import store from "../store/configureStore";

const TYPE_NOTIFY = 'notify';
const TYPE_SALE_HUB = 'SaleHub';
import { Subject } from 'rxjs';
import realmStore from '../data/realm/RealmStore'
import { decodeBase64 } from './Base64'

class SignalRManager {

    init() {
        this.info = {
            SessionId: "NR49Agi4hu7nTpidgFHd",
            rId: "LeTx/eEAOlM=",
            bId: "ZnoAkt+5g3Q="
        }
        this.subject = new Subject()
        this.subject.distinct(serverEvent => serverEvent.Version)
            .subscribe(serverEvent => this.onReceiveServerEvent(serverEvent))
        const connectionHub = signalr.hubConnection("https://signalr.pos365.vn/signalr", {
            headers: {
                "User-Agent": "vn.pos365.cashierspos365",
                "Cookie": "ss-id=" + this.info.SessionId,
            },
            qs: {
                'rid': this.info.rId, 'bid': this.info.bId
            }
        })

        connectionHub.logging = true
        this.proxy = connectionHub.createHubProxy("saleHub")
        this.proxy.on("Update", (serverEvent) => { this.subject.next(serverEvent)})
        connectionHub.start()
            .done(() => {
                console.log('Now connected, connection ID=' + connectionHub.id);
                this.isStartSignalR = true
            })
            .fail(() => {
                console.log("Failed");

            })
    }

    async onReceiveServerEvent(serverEvent) {
        console.log("onReceiveServerEvent", serverEvent);
        if (serverEvent && serverEvent.Compress) {
          serverEvent.JsonContent = decodeBase64(serverEvent.JsonContent || "")
          serverEvent.Compress = false
        }
        await realmStore.insertServerEvent(serverEvent)
    }

    sendMessage = (message, type = TYPE_SALE_HUB) => {
        if (this.isStartSignalR) {
            this.proxy.invoke(type, message)
                .done((response) => {
                    console.log('', response);
                })
                .fail(() => {
                    console.warn('Something went wrong when calling server, it might not be up and running?')
                });
        } else {
            console.log("settimeout");
            Alert.alert("Opps!", "Cannot connect to server")

        }
    }

}

const signalRManager = new SignalRManager()

export default signalRManager;