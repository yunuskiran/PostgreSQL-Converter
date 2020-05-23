export class ColumnTypes {
    items: Map<string, string>;
    unqualItems: Map<string, number>;
    constructor() {
        this.items = new Map<string, string>();
        this.items.set("int", "int");
        this.items.set("nvarchar", "varchar");
        this.items.set("nchar", "char");
        this.items.set("varchar", "varchar");
        this.items.set("varchar", "varchar");
        this.items.set("text", "text");
        this.items.set("char", "char");
        this.items.set("smallint", "smallint");
        this.items.set("tinyint", "tinyint");
        this.items.set("bigint", "bigint");
        this.items.set("decimal", "numeric");
        this.items.set("float", "double precision");
        this.items.set("real", "real");
        this.items.set("date", "date");
        this.items.set("datetime", "timestamp");
        this.items.set("datetime2", "timestamp");
        this.items.set("smalldatetime", "timestamp");
        this.items.set("time", "time");
        this.items.set("timestamp", "bytea");
        this.items.set("rowversion", "bytea");
        this.items.set("datetimeoffset", "timestamp with time zone");
        this.items.set("image", "bytea");
        this.items.set("binary", "bytea");
        this.items.set("varbinary", "bytea");
        this.items.set("money", "numeric");
        this.items.set("smallmoney", "numeric(6,4)");
        this.items.set("uniqueidentifier", "uuid");
        this.items.set("xml", "xml");

        this.unqualItems = new Map<string, number>();
        this.unqualItems.set("bytea", 1);
        this.unqualItems.set("timestamp with time zone", 1);
    }

    getTypes() {
        return this.items;
    }

    findType(key: string) {
        if (this.items.get(key)!==null) {
            this.items.get(key);
        } else {
            return '';
        }
    }

    getUnqualTypes() {
        return this.unqualItems;
    }

    findUnqualType(key: string) {
        return this.unqualItems.get(key);
    }
}