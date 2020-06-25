const Realm = require('realm');
import { Observable } from 'rxjs';
import { RealmBase } from './RealmBase';
import { change_alias } from '../../common/Utils';

class RealmStore extends RealmBase {

    constructor() {
        return super();

    }

    removeAllListener() {
        realm.removeAllListeners()
    }

    //override
    insertDatas(schema, datas) {
        return super.insertDatas(databaseOption, schema, datas);
    }

    deleteAll = async () => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            realm.deleteAll()
            resolve()
        }))
    }

    //server event
    insertServerEvent = async (newServerEvent) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let serverEvent = realm.objectForPrimaryKey(SchemaName.SERVER_EVENT, newServerEvent.RowKey)
            if (serverEvent && serverEvent.Version > newServerEvent.Version) {
                resolve({ result: false, serverEvent: serverEvent })
            } else {
                realm.create(SchemaName.SERVER_EVENT, newServerEvent, true)
                resolve({ result: true, serverEvent: newServerEvent })
            }
        })
        )
    }

    insertServerEvents(newServerEvents) {
        return Observable.create(async (observer) => {
            let realm = await Realm.open(databaseOption)

            realm.write(() => {
                newServerEvents.map(newServerEvent => {
                    let serverEvent = realm.objectForPrimaryKey(SchemaName.SERVER_EVENT, newServerEvent.RowKey)
                    if (serverEvent && serverEvent.Version > newServerEvent.Version) {
                        observer.next({ result: false, serverEvent: serverEvent })
                    } else {
                        realm.create(SchemaName.SERVER_EVENT, newServerEvent, true)
                        observer.next({ result: true, serverEvent: newServerEvent })
                    }
                })
                observer.complete()
            })
        })
    }

    queryServerEvents = async () => {
        return this.queryAll(databaseOption, SchemaName.SERVER_EVENT)
    }

    //Room
    insertRooms(newRooms) {
        return this.insertDatas(databaseOption, SchemaName.ROOM, newRooms)
    }

    queryRooms() {
        return this.queryAll(databaseOption, SchemaName.ROOM)
    }

    //RoomGroup
    insertRoomGroups(newRoomGroups) {
        return this.insertDatas(databaseOption, SchemaName.ROOM_GROUP, newRoomGroups)
    }

    queryRoomGroups() {
        return this.queryAll(databaseOption, SchemaName.ROOM_GROUP)
    }

    //Product
    async insertProducts(newProducts) {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            newProducts.map(product => {
                product.BasePrice = product.Price;
                product.NameLatin = change_alias(product.Name)
                product.ProductImages = JSON.stringify(product.ProductImages);
                realm.create(SchemaName.PRODUCT, product, true);
            })
            resolve(newProducts)
        })
        )
    }

    queryProducts() {
        return this.queryAll(databaseOption, SchemaName.PRODUCT)
    }

    //Categories
    insertCategories(newCategories) {
        return this.insertDatas(SchemaName.CATEGORIES, newCategories)
    }

    queryCategories() {
        return this.queryAll(databaseOption, SchemaName.CATEGORIES)
    }

    //Topping
    insertTopping(newTopping) {
        return this.insertDatas(SchemaName.TOPPING, newTopping)
    }

    queryTopping() {
        return this.queryAll(databaseOption, SchemaName.TOPPING)
    }


}

//define schema
export const SchemaName = {
    SERVER_EVENT: "ServerEventSchema",
    ROOM: "Room",
    ROOM_GROUP: "RoomGroup",
    PRODUCT: "Product",
    CATEGORIES: "Categories",
    TOPPING: "Topping"
}

const ServerEventSchema = {
    name: SchemaName.SERVER_EVENT,
    primaryKey: 'RowKey',
    properties: {
        RoomId: 'int',
        Position: 'string',
        Version: 'int',
        JsonContent: "string",
        Compress: 'bool',
        PartitionKey: 'string',
        RowKey: 'string',
        Timestamp: 'string',
        ETag: 'string'
    }
}

const RoomSchema = {
    name: SchemaName.ROOM,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string',
        Position: 'int',
        Description: { type: 'string', default: "" },
        RoomGroupId: { type: 'int', default: 0 },
        Printer: { type: 'string', default: "" },
        ProductId: { type: 'int', default: 0 },
    }
}

const RoomGroupSchema = {
    name: SchemaName.ROOM_GROUP,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string'
    }
}

const ProductSchema = {
    name: SchemaName.PRODUCT,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Code: 'string',
        Name: 'string',
        NameLatin: { type: 'string', default: '' },
        AttributesName: { type: 'string', default: '' },
        Price: 'double',
        PriceLargeUnit: 'double',
        OnHand: 'double',
        ProductImages: 'string',
        IsSerialNumberTracking: 'bool',
        IsPercentageOfTotalOrder: 'bool',
        ConversionValue: 'double',
        SplitForSalesOrder: 'bool',
        Printer: { type: 'string', default: '' },
        ProductType: 'int',
        Coefficient: { type: 'double', default: 0.0 },
        BonusPoint: 'double',
        BonusPointForAssistant: 'double',
        BonusPointForAssistant2: 'double',
        BonusPointForAssistant3: 'double',
        PriceConfig: { type: 'string', default: "{}" },
        BlockOfTimeToUseService: 'double',
        IsPriceForBlock: 'bool',
        CategoryId: { type: 'int', default: 0 },
        ProductId: { type: 'int', default: 0 },
        Code2: { type: 'string', default: '' },
        Code3: { type: 'string', default: '' },
        Code4: { type: 'string', default: '' },
        OnlinePrice: { type: 'double', default: 0.0 },
        Unit: { type: 'string', default: '' },
        LargeUnit: { type: 'string', default: '' },
        IsTimer: { type: 'bool', default: false },
        OrderQuickNotes: { type: 'string', default: '' },
        BasePrice: { type: 'double', default: 0.0 },
        Description: { type: 'string', default: '' },
        IsLargeUnit: { type: 'bool', default: false },
        UnitPrice: { type: 'double', default: 0.0 },
        DiscountRatio: { type: 'double', default: 0.0 },
        Checkin: { type: 'string', default: '' },
        Processed: { type: 'double', default: 0.0 },
        labelPrinted: { type: 'double', default: 0.0 },
        Serveby: { type: 'double', default: 0.0 },
        Checkout: { type: 'string', default: '' },
        Topping: { type: 'string', default: "" },
        TotalTopping: { type: 'double', default: 0.0 },
        StopTimer: { type: 'bool', default: false },
        Hidden: { type: 'bool', default: false },
        IsCheckPriceServer: { type: 'bool', default: true },

    }
}

const CategoriesSchema = {
    name: SchemaName.CATEGORIES,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string',
        ParentId: { type: 'int', default: 0 },
    },

}

const ToppingsSchema = {
    name: SchemaName.TOPPING,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        ExtraId: 'int',
        Quantity: 'int',
        Price: 'double',
        ExtraGroup: { type: 'string', default: '' },
        Name: 'string',
        Code: 'string'
    },

}

const databaseOption = {
    path: 'Pos365Boss.realm',
    schema: [ServerEventSchema, RoomSchema, RoomGroupSchema, ProductSchema, CategoriesSchema, ToppingsSchema],
    schemaVersion: 22
}

const realm = new Realm(databaseOption);

const realmStore = new RealmStore();

export default realmStore;