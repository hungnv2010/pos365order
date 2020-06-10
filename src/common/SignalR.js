import signalr from 'react-native-signalr';
import store from "../store/configureStore";

const TYPE_NOTIFY = 'notify';
const TYPE_SALE_HUB = 'SaleHub';
import { Subject } from 'rxjs';
import realmStore from '../data/realm/RealmStore'
import { decodeBase64 } from './Base64'
import I18n from '../common/language/i18n'
import dialogManager from '../components/dialog/DialogManager';

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
        this.proxy.on("Update", (serverEvent) => { this.subject.next(serverEvent) })
        connectionHub.start()
            .done(() => {
                console.log('Now connected, connection ID=' + connectionHub.id);
                this.isStartSignalR = true
            })
            .fail(() => {
                console.log("Failed");

            })
    }

    sendMessageOrder = (message) => {
        console.log('sendMessageOrder message ', message);
        // this.initSignalR();
        if (this.isStartSignalR) {
            this.proxy.invoke("notify", message)
                .done((response) => {
                    console.log('sendMessageOrder response ', response);
                    // this.alert = I18n.t('gui_tin_nhan_thanh_cong');
                    dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_thanh_cong'), I18n.t('thong_bao'))
                })
                .fail(() => {
                    // this.alert = I18n.t('gui_tin_nhan_that_bai');
                    dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_that_bai'), I18n.t('thong_bao'))
                    console.warn('Something went wrong when calling server, it might not be up and running?')
                });
        } else {
            console.log("settimeout");
            // Alert.alert("Opps!", "Cannot connect to server")
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
        }
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