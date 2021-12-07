class NaiveDict {
    constructor() {
        this.keys = []
        this.values = []
    }
    set(key, value) {
        this.keys.push(key)
        this.values.push(value)
    }
    get(lookupKey) {
        for (var i = 0; i < this.keys.length; i++) {
            var key = this.keys[i]
            if (key === lookupKey) {
                return this.values[i]
            }
        }
    }
}

class HashTable {
    constructor() {
        this.bucketCount = 100000
        this.buckets = []
        for (var i = 0; i < this.bucketCount; i++) {
            this.buckets.push(new NaiveDict())
        }
    }
    hashFunction(key) {
        var hash = 0
        if (key.length == 0)
            return hash
        for (var i = 0; i < key.length; i++) {
            hash = (hash << 5) - hash
            hash = hash + key.charCodeAt(i)
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
    }
    getBucketIndex(key) {
        return this.hashFunction(key) % this.bucketCount
    }
    getBucket(key) {
        return this.buckets[this.getBucketIndex(key)]
    }
    set(key, value) {
        this.getBucket(key).set(key, value)
    }
    get(lookupKey) {
        return this.getBucket(lookupKey).get(lookupKey)
    }
}

const db = new HashTable

const set = (k, v) => {
    db.set(k, v)
}

const get = (k) => {
    return db.get(k)
}

module.exports = { set, get }