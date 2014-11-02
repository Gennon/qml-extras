/***************************************************************************
 * Whatsoever ye do in word or deed, do all in the name of the             *
 * Lord Jesus, giving thanks to God and the Father by him.                 *
 * - Colossians 3:17                                                       *
 *                                                                         *
 * Click App Store - An app for viewing the available Ubuntu Touch apps    *
 * Copyright (C) 2013 Michael Spencer <sonrisesoftware@gmail.com>          *
 *                                                                         *
 * This program is free software: you can redistribute it and/or modify    *
 * it under the terms of the GNU General Public License as published by    *
 * the Free Software Foundation, either version 3 of the License, or       *
 * (at your option) any later version.                                     *
 *                                                                         *
 * This program is distributed in the hope that it will be useful,         *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of          *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the            *
 * GNU General Public License for more details.                            *
 *                                                                         *
 * You should have received a copy of the GNU General Public License       *
 * along with this program. If not, see <http://www.gnu.org/licenses/>.    *
 ***************************************************************************/
.pragma library

Qt.include('promises.js')

function post(path, args) {
    return request(path, "POST", args)
}

function patch(path, args) {
    return request(path, "POST", args)
}

function put(path, args) {
    return request(path, "PUT", args)
}

//function delete(path, options, args) {
//    request(path, "DELETE", options, args)
//}

function get(path, args) {
    return request(path, "GET", args)
}

function request(path, call, args) {
    var address = path

    if (!args) args = {}

    var options = args.options ? args.options : []
    var headers = args.headers ? args.headers : {}
    var body = args.body ? args.body : undefined

    if (options.length > 0)
        address += (address.indexOf('?') == -1 ? "?" : "&") + options.join("&").replace(/ /g, "%20")

    print(call, address, body)
    print("Headers", JSON.stringify(headers))

    var promise = new Promise()

    var doc = new XMLHttpRequest();   
    doc.timeout = 1000;
    doc.onreadystatechange = function() {
        if (doc.readyState === XMLHttpRequest.DONE) {
            //print(doc.getResponseHeader("X-RateLimit-Remaining"))

            //print(doc.responseText)


            var responseArray = doc.getAllResponseHeaders().split('\n')
            var responseHeaders = {}
            for (var i = 0; i < responseArray.length; i++) {
                var header = responseArray[i]
                var items = split(header, ':', 1)
                responseHeaders[items[0]] = items[1]
            }

            //print("Status:",doc.status, "for call", call, address, headers['If-None-Match'], responseHeaders['etag'])

            promise.info.headers = responseHeaders
            promise.info.status = doc.status

            if (doc.status == 200 || doc.status == 201 || doc.status == 202 || doc.status === 304) {
                print("Calling back with no error...")
                promise.resolve(doc.responseText)
            } else {
                print("Calling back with error...")
                promise.reject(doc.responseText)
            }
        }
     }
    doc.ontimeout = function () {
        callback(true, 0, "", args)
    }

    doc.open(call, address, true);
    for (var key in headers) {
        //print(key + ": " + headers[key])
        doc.setRequestHeader(key, headers[key])
    }
    if (body)
        doc.send(body)
    else
        doc.send();

    return promise
}

function split(string, sep, limit) {
    var array = []
    for (var i = 0; i < limit; i++) {
        var index = string.indexOf(sep)
        if (index === -1) {
            array.push(string)
            string = undefined
            break;
        } else {
            array.push(string.substring(0, index))
            string = string.substring(index+1)
        }
    }

    if (string !== undefined)
        array.push(string.trim())

    return array
}
