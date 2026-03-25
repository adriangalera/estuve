// meters per degree of latitude (approximate, varies from ~110.567km at equator to ~111.699km at poles)
const METERS_PER_DEGREE_LAT = 111320.0;
// pi / 180 — converts degrees to radians for cos() calculation
const DEG_TO_RAD = Math.PI / 180;

export class LngLat {
    constructor(lng, lat) {
        this.lat = lat
        this.lng = lng
    }
}
export class QuadTreeNode {
    constructor(ne, nw, se, sw, maxCapacityperNode) {
        // boundaries
        this.northEastCoord = ne
        this.northWestCoord = nw
        this.southEastCoord = se
        this.southWestCoord = sw

        // children
        this.northEastChild = undefined
        this.northWestChild = undefined
        this.southEastChild = undefined
        this.southWestChild = undefined

        // node values
        this.values = []
        this.maxCapacity = maxCapacityperNode
    }
    static empty(maxCapacityperNode = 100) {
        return new QuadTreeNode(new LngLat(180, 90), new LngLat(-180, 90), new LngLat(180, -90), new LngLat(-180, -90), maxCapacityperNode)
    }
    belongs(lnglat) {
        return this.belongsLatLng(lnglat.lat, lnglat.lng)
    }
    belongsLatLng(lat, lng) {
        return lng <= this.northEastCoord.lng && lng > this.northWestCoord.lng &&
            lat <= this.northWestCoord.lat && lat > this.southWestCoord.lat
    }
    insertLatLng(lat, lng) {
        return this.insert(new LngLat(lng, lat))
    }
    insert(lnglat) {
        if (!this.belongs(lnglat)) {
            return false
        }
        if (this.hasChildNodes()) {
            const insertedNorthEast = this.northEastChild.insert(lnglat)
            const insertedNorthWest = this.northWestChild.insert(lnglat)
            const insertedSouthEast = this.southEastChild.insert(lnglat)
            const insertedSouthWest = this.southWestChild.insert(lnglat)
            return insertedNorthEast || insertedNorthWest || insertedSouthEast || insertedSouthWest
        } else {
            this.values.push(lnglat)

            if (this.values.length >= this.maxCapacity) {
                this.northEastChild = new QuadTreeNode(
                    this.northEastCoord,
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, this.northEastCoord.lat),
                    new LngLat(this.southEastCoord.lng, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    this.maxCapacity
                )
                this.northWestChild = new QuadTreeNode(
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, this.northEastCoord.lat),
                    this.northWestCoord,
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    new LngLat(this.northWestCoord.lng, (this.northWestCoord.lat + this.southWestCoord.lat) / 2),
                    this.maxCapacity
                )
                this.southEastChild = new QuadTreeNode(
                    new LngLat(this.northEastCoord.lng, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    this.southEastCoord,
                    new LngLat((this.southEastCoord.lng + this.southWestCoord.lng) / 2, this.southEastCoord.lat),
                    this.maxCapacity
                )
                this.southWestChild = new QuadTreeNode(
                    new LngLat((this.northEastCoord.lng + this.northWestCoord.lng) / 2, (this.northEastCoord.lat + this.southEastCoord.lat) / 2),
                    new LngLat(this.northWestCoord.lng, (this.northWestCoord.lat + this.southWestCoord.lat) / 2),
                    new LngLat((this.southEastCoord.lng + this.southWestCoord.lng) / 2, this.southWestCoord.lat),
                    this.southWestCoord,
                    this.maxCapacity
                )

                for (let item of this.values) {
                    const insertedNorthEast = this.northEastChild.insert(item)
                    this.northWestChild.insert(item)
                    this.southEastChild.insert(item)
                    this.southWestChild.insert(item)
                }
                this.values = []
            }

            return true


        }
    }
    hasChildNodes() {
        return this.northEastChild != undefined && this.northWestChild != undefined && this.southEastChild != undefined && this.southWestChild != undefined
    }
    locationIsOnTree(lat, lng, tolerance_meters) {
        return this.lngLatIsOnTree(new LngLat(lng, lat), tolerance_meters)
    }
    lngLatIsOnTree(target, tolerance_meters = 10) {
        if (!this.belongs(target)) return false;
        if (this.hasChildNodes()) {
            return this.northEastChild.lngLatIsOnTree(target, tolerance_meters) ||
                this.southEastChild.lngLatIsOnTree(target, tolerance_meters) ||
                this.northWestChild.lngLatIsOnTree(target, tolerance_meters) ||
                this.southWestChild.lngLatIsOnTree(target, tolerance_meters)
        } else {
            for (let item of this.values) {
                if (this.equalsWithTolerance(target, item, tolerance_meters)) {
                    return true
                }
            }
        }
        return false
    }
    equalsWithTolerance(lnglat1, lnglat2, tolerance) {
        const { lat_drift_allowed, lng_drift_allowed } = this.latLngTolerance(lnglat1.lat, lnglat1.lng, tolerance)
        const lat_diff = Math.abs(lnglat1.lat - lnglat2.lat)
        const lng_diff = Math.abs(lnglat1.lng - lnglat2.lng)
        return lat_diff <= lat_drift_allowed && lng_diff <= lng_drift_allowed
    }
    latLngTolerance(lat, lng, meters) {
        // https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
        const coef = meters / METERS_PER_DEGREE_LAT;
        const lat_drift_allowed = coef;
        const lng_drift_allowed = coef / Math.cos(lat * DEG_TO_RAD);
        return { lat_drift_allowed, lng_drift_allowed }
    }
    points() {
        let points = []
        for (let p of this.values) {
            points.push([p.lat, p.lng])
        }

        this._addPoints(this.northEastChild, points)
        this._addPoints(this.northWestChild, points)
        this._addPoints(this.southEastChild, points)
        this._addPoints(this.southWestChild, points)
        return points
    }
    _addPoints(x, points) {
        if (x) {
            for (let pointPair of x.points()) {
                points.push(pointPair)
            }
        }
    }
    serialize() {
        return JSON.stringify(this.toObject());
    }

    toObject() {
        return {
            northEastCoord: this.northEastCoord,
            northWestCoord: this.northWestCoord,
            southEastCoord: this.southEastCoord,
            southWestCoord: this.southWestCoord,
            values: this.values,
            maxCapacity: this.maxCapacity,
            hasChildren: this.hasChildNodes(),
            northEastChild: this.northEastChild ? this.northEastChild.toObject() : null,
            northWestChild: this.northWestChild ? this.northWestChild.toObject() : null,
            southEastChild: this.southEastChild ? this.southEastChild.toObject() : null,
            southWestChild: this.southWestChild ? this.southWestChild.toObject() : null,
        };
    }

    static deserialize(serializedData) {
        const data = JSON.parse(serializedData);
        return this.fromObject(data);
    }

    static fromObject(data) {
        // Create a new instance of QuadTreeNode
        const node = new QuadTreeNode(
            new LngLat(data.northEastCoord.lng, data.northEastCoord.lat),
            new LngLat(data.northWestCoord.lng, data.northWestCoord.lat),
            new LngLat(data.southEastCoord.lng, data.southEastCoord.lat),
            new LngLat(data.southWestCoord.lng, data.southWestCoord.lat),
            data.maxCapacity
        );

        // Restore the values array
        node.values = data.values.map(item => new LngLat(item.lng, item.lat));

        // Recursively restore child nodes
        if (data.northEastChild) {
            node.northEastChild = this.fromObject(data.northEastChild);
        }
        if (data.northWestChild) {
            node.northWestChild = this.fromObject(data.northWestChild);
        }
        if (data.southEastChild) {
            node.southEastChild = this.fromObject(data.southEastChild);
        }
        if (data.southWestChild) {
            node.southWestChild = this.fromObject(data.southWestChild);
        }

        return node;
    }
    clear() {
        this.northEastCoord = new LngLat(180, 90)
        this.northWestCoord = new LngLat(-180, 90)
        this.southEastCoord = new LngLat(180, -90)
        this.southWestCoord = new LngLat(-180, -90)

        // children
        this.northEastChild = undefined
        this.northWestChild = undefined
        this.southEastChild = undefined
        this.southWestChild = undefined

        // node values
        this.values = []
    }
}