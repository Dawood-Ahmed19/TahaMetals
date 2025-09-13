import Datastore from "nedb-promises";

const inventoryDb = Datastore.create({
  filename: "inventory.db",
  autoload: true,
});

const quotationDb = Datastore.create({
  filename: "quotations.db",
  autoload: true,
});

export { inventoryDb, quotationDb };
