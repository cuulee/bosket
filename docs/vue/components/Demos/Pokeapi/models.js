export class Item {

    constructor(data) {
        Object.assign(this, formatData(data))
    }

    display(h) {
        if(this.url && this.name) {
            return <span class="subcategory">{ this.name }</span>
        }

        const properties = []
        for(const prop in this) {
            if(!prop.startsWith("__") && !(typeof this[prop] === "object") && !(typeof this[prop] === "function")) {
                properties.push(<div class="property-row" key={ prop }><label>{ prop }</label><span>{ "" + this[prop] }</span></div>)
            }
        }
        return <div class={ this.__subsection ? "subsection" : "" }>{ properties }</div>
    }
}

const cache = new Map()
export const cachedFetch = (url, ...args) => {
    if(cache.has(url)) return Promise.resolve(cache.get(url))
    return fetch(url, ...args)
        .then(response => response.json())
        .then(json => {
            cache.set(url, json)
            return json
        })
}

const formatData = d => {
    const data = { ...d }
    if(data.url) {
        const url = data.url
        data.__children = () => cachedFetch(url).then(json => [new Item(json)])
        return data
    }
    data.__subsection = true
    for(const prop in data) {
        if(prop.startsWith("__")) continue

        if(data[prop] instanceof Array) {
            if(!data.__children) data.__children = []
            data.__children.push({
                display: h => <span class="subcategory">{ "" + prop }</span>,
                __children: data[prop].map(_ => new Item(_))
            })
            delete data[prop]
        } else if(data[prop] && typeof data[prop] === "object") {
            if(!data.__children) data.__children = []
            data.__children.push({
                display: h => <span class="subcategory">{ "" + prop }</span>,
                __children: [new Item(data[prop])]
            })
            delete data[prop]
        }
    }
    return data
}
