/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable max-classes-per-file */
// modified matt zeunert's implemetation
// inspired from mark wilbur

// naive key-value store (dictionary)
// worst-case performance is O(n)
class NaiveDict {
  constructor() {
    this.keys = [];
    this.values = [];
  }

  set(key, value) {
    this.keys.push(key);
    this.values.push(value);
  }

  get(lookupKey) {
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      if (key === lookupKey) {
        return this.values[i];
      }
    }
    return null;
  }
}

class HashTable {
  constructor() {
    this.bucketCount = 100000; // entry or slot to store number of kv pair
    this.buckets = [];
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets.push(new NaiveDict());
    }
  }

  // eslint-disable-next-line class-methods-use-this
  hashFunction(key) {
    let hash = 0;
    if (!key.length) { return hash; }
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash;
      hash += key.charCodeAt(i);
      hash &= hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  getBucketIndex(key) { // determine bucket to key by using modulo of key hash
    return this.hashFunction(key) % this.bucketCount;
  }

  getBucket(key) { // return bucket index from calculation
    return this.buckets[this.getBucketIndex(key)];
  }

  set(key, value) { // insert value in naive dictionary
    this.getBucket(key).set(key, value);
  }

  get(lookupKey) { // retrieve value by key
    return this.getBucket(lookupKey).get(lookupKey);
  }
}

const db = new HashTable();

const set = (k, v) => {
  db.set(k, v);
};

const get = (k) => db.get(k);

module.exports = { set, get };
