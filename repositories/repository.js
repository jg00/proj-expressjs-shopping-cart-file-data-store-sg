const fs = require("fs");
const crypto = require("crypto");

module.exports = class Repository {
  // 1 Init file
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repository requires a filename");
    }

    this.filename = filename;

    // Check file exists or create
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, "[]");
    }
  }

  // 3 Create - specific implementations in derived classes.
  async create(attrs) {
    attrs.id = this.randomId();

    const records = await this.getAll();
    records.push(attrs);

    await this.writeAll(records);

    return attrs;
  }

  // 2 Get Full List
  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }

  // 4 Replace File With New List Of Records
  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  // 5 Generate Random Id
  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  // 6 Find One By Id
  async getOne(id) {
    const records = await this.getAll();

    return records.find((record) => record.id === id);
  }

  // 7 Delete Record
  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);

    await this.writeAll(filteredRecords);
  }

  // 8 Update Record - When updating we expect to have a record already exists. (How can we have an id to a record that dosen't exists at all?)
  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id); // Not reusing getOne(id) because we have to 'save all' records back anyway

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs); // Mutates specific record referenced in records
    await this.writeAll(records);
  }

  // 9 getOneBy({ email: 'test@test.com', password: 'password' }) - Filter object with any arbitrary set of key/value pairs to filter by.
  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      // Check if any property value is not the same
      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      // Return first record with matching key/value pairs
      if (found) return record;
    }
  }
};
