'use strict';
let kalista = () => {
  return {
    version: 'kalista 1.3',
    gen_id: (obj_tree, path, i) => {
      if(!path){ path = ''}
      if(!i){ i = 0}
      let l_path = path + '.' + i
      let obj = obj_tree
      obj['__id__'] = l_path
      if(obj.children){
        for(i=0;i<obj.children.length;i++){

          obj.children[i] = kalista().gen_id(obj.children[i], l_path, i)
        }
      }
      return obj
    },
    dom: function(tag, prop, children) {
      let c = 1;
      let x = 0;
      let obj = { 'tag': tag, 'children': []};
      if(typeof prop === 'object') {
        c++
        obj.prop = prop
      }
      if(typeof tag === 'function') {
        obj = tag.call(this, obj.prop)
      }
      for(let i = c;i < arguments.length;i++){
        if(typeof arguments[i] === 'object') {
          obj.children[i-c] = arguments[i]
        } else {
          obj.children[i-c] = {'tag': '__text__', 'text': arguments[i]}
        }
      }
      return obj
    },
    render: (tree) => {
      let el
      if(typeof tree.tag === 'object'){
        el = kalista().render(tree.tag)
      } else if(typeof tree.tag === 'function') {
        el = kalista().render(kalista().gen_id(tree.tag.call(this, tree.prop), kalista().id(tree.__id__).getParent(), kalista().id(tree.__id__).getIdInParent()))
      } else {
        el = document.createElement(tree.tag);
      }
      if (tree.prop) {
        for (let i = 0; i < Object.keys(tree.prop).length; i++) {
          if(tree.prop.hideAttr) {
            if(tree.prop.hideAttr.split(' ').indexOf(Object.keys(tree.prop)[i]) !== -1 || tree.prop.hideAttr === '*'){
            }
          } else {
            el.setAttribute(Object.keys(tree.prop)[i], tree.prop[Object.keys(tree.prop)[i]])
          }
        }

      }
      el.setAttribute('kalista-dataid', tree.__id__)
      if (tree.text) {
        el.innerText = tree.text;
      }
      if(tree.children){
        for (let i = 0; i < tree.children.length; i++) {
          if(tree.children[i].tag === '__text__'){
            el.appendChild(document.createTextNode(tree.children[i].text))
          } else {
            el.appendChild(kalista().render(tree.children[i], el));
          }
        }
      }
      return el;
    },
    diff: (obj1, obj2, el) => {
      let a = obj1, b = obj2
    if(!Array.isArray(a.children)) { a.children = []}
    if(!Array.isArray(b.children)) { b.children = []}
    if(a.prop == null){a.prop = {}}
    if(b.prop == null){b.prop = {}}
    let same = true, temp_result, temp_selector
    if(a.tag === b.tag){
      if(typeof a.tag === 'function' && typeof b.tag === 'function' && a.tag.call(this, a.prop) !== b.tag.call(this, b.prop)){
        let temp_a = kalista().gen_id(a.tag.call(this, a.prop), kalista().id(a.__id__).getParent(), kalista().id(a.__id__).getIdInParent())
        let temp_b = kalista().gen_id(b.tag.call(this, b.prop), kalista().id(b.__id__).getParent(), kalista().id(b.__id__).getIdInParent())
        b = kalista().diff(temp_a, temp_b, el).newRenderTree
      }
      if(typeof a.tag === 'object' && typeof b.tag === 'object'){
        kalista().diff(kalista().gen_id(a.tag, kalista().id(a.__id__).getParent()), kalista().gen_id(b.tag, kalista().id(b.__id__).getParent()), el)
      }
      if(keys(a.prop).length !== keys(b.prop).length){
        // console.log('uneven amount of properties')
        if(keys(a.prop).length > keys(b.prop).length){
          for(let i=0;i<keys(a.prop).length;i++){
            if(keys(b.prop)[i] == undefined){
              // console.log('remove "' + keys(a.prop)[i] + ': ' + key(a.prop, i) + '"', a.__id__)
              el.querySelector('[kalista-dataid="' + a.__id__ + '"]').removeAttribute(keys(a.prop)[i])
            } else if(a.prop[keys(a.prop)[i]] !== b.prop[keys(a.prop)[i]] || keys(a.prop)[i] !== keys(b.prop)[i]){
              // console.log('change "' + keys(a.prop)[i] + ': ' + key(a.prop, i) + '" to "' + keys(b.prop)[i] + ': ' + key(b.prop, i) + '"', a.__id__)
              el.querySelector('[kalista-dataid="' + a.__id__ + '"]').setAttribute(keys(b.prop)[i], key(b.prop, i))
            }
          }
        } else if(keys(a.prop).length < keys(b.prop).length){
          for(let i=0;i<(keys(b.prop).length - keys(a.prop).length);i++){
            // console.log('add "' + keys(b.prop)[i+keys(a.prop).length] + ': ' + key(b.prop, i+keys(a.prop).length) + '"', a.__id__)
            el.querySelector('[kalista-dataid="' + a.__id__ + '"]').setAttribute(keys(b.prop)[i+keys(a.prop).length], key(b.prop, i+keys(a.prop).length))
          }
        }
        same = false
      } else{
        for(let i=0;i<keys(a.prop).length;i++){
          if(a.prop[keys(a.prop)[i]] !== b.prop[keys(a.prop)[i]] || keys(a.prop)[i] !== keys(a.prop)[i]){
            // console.log('change "' + keys(a.prop)[i] + ': ' + key(a.prop, i) + '" to "' + keys(b.prop)[i] + ': ' + key(b.prop, i) + '"', a.__id__)
            el.querySelector('[kalista-dataid="' + a.__id__ + '"]').setAttribute(keys(b.prop)[i], key(b.prop, i))
            same = false
          }
        }
      }
      if(a.children.length === b.children.length){
        for(let i=0;i<a.children.length;i++){
          temp_result = kalista().diff(a.children[i], b.children[i], el)
          if(!temp_result.isSame){
            same = false
            b.children[i] = temp_result.newRenderTree
          }
        }
      } else {
        if(a.children.length > b.children.length){
          for(let i=0;i<a.children.length;i++){
            if(b.children[i]){
              temp_result = kalista().diff(a.children[i], b.children[i], el)
              if(!temp_result.isSame){
                same = false
                b.children[i] = temp_result.newRenderTree
              }
            } else {
              // console.log('remove child node at ' + a.children[i].__id__ , a.children[i])
              el.querySelector('[kalista-dataid="' + a.children[i].__id__ + '"]').remove()
            }
          }
        } else if(b.children.length > a.children.length){
          for(let i=0;i<b.children.length;i++){
            if(a.children[i]){
              temp_result = kalista().diff(a.children[i], b.children[i], el)
              if(!temp_result.isSame){
                same = false
                b.children[i] = temp_result.newRenderTree
              }
            } else {
              // console.log('add child node at ' + b.__id__ , b.children[i])
              el.querySelector('[kalista-dataid="' + kalista().id(b.children[i].__id__).getParent() + '"]').appendChild(kalista().render(b.children[i]))

            }
          }
        }
      }
    } else {
      // console.log('wrong tag: "' + a.tag + '" and "' + b.tag + '"')
      same = false
    }
    if(a.tag === '__text__' && b.tag === '__text__'){
      if(a.text !== b.text){
        temp_selector = el.querySelector('[kalista-dataid="' + kalista().id(a.__id__).getParent() + '"]')
        temp_selector.firstChild.remove()
        temp_selector.appendChild(document.createTextNode(b.text))
        // console.log('change "' + a.text + '" to "' + b.text + '" at ' + a.__id__)
      }
    }
    b.__id__ = a.__id__
    return {'isSame': same, 'newRenderTree': b}
  },
  id: (id) => {
    let temp
    return {
      getParent: () => {
        return id.substring(0, id.lastIndexOf('.'))
      },
      back: (n) => {
        temp = id
        n = n + 1
        for(i=0;i<n;i++){
          temp = temp.substring(0, temp.lastIndexOf('.'))
        }
        return temp
      },
      getIdInParent: () => {
        return id.substring(id.lastIndexOf('.')+1, id.length)
      }
    }
  }
  }
}
let _stores = {}
let store = () => {
  return {
    create: function(name, data) {
      _stores[name] = {'data': data, 'callback': []}
    },
    subscribe: function(name, callback) {
      _stores[name].callback[_stores[name].callback.length] = callback
    },
    change: function(name, data) {
      for (let i = 0; i < Object.keys(_stores[name].data).length; i++) {
        if(data[Object.keys(_stores[name].data)[i]]) {
          _stores[name].data[Object.keys(_stores[name].data)[i]] = data[Object.keys(_stores[name].data)[i]]
        }
      }
      for (let i = 0; i < _stores[name].callback.length; i++) {
        _stores[name].callback[i].call(this, _stores[name].data)
      }
    },
    get: function(name) {
      return _stores[name].data
    }
  }
}

let route = () => {
  let hash = location.hash.substr(1)
  if(!hash.startsWith('/')) hash = "/" + hash
  location.hash = hash
  window.addEventListener('hashchange', function(evt) {
    hash = location.hash.substr(1)
    if(!hash.startsWith('/')) hash = "/" + hash
    location.hash = hash
  })
  let matches = (route) => {
    return new RegExp("^" + route.split("*").join(".*[^/]") + "$").test(hash)
  }
  let set = (route) => {
    hash = route.startsWith('/') ? route : '/' + route
    location.hash = hash
  }
  return {
    matches,
    set,
    hash
  }
}

let setup = (target, store_name, shell) => {
  let old_tree, new_tree
  let render = (state) => {
    new_tree = kalista().gen_id(App(state))
    target.replaceChild(kalista().render(new_tree), target.firstChild)
  }

  let diff = (state) => {
    old_tree = new_tree
    new_tree = kalista().diff(old_tree, kalista().gen_id(App(state)), target).newRenderTree
  }

  shell.remove()
  render(store().get(store_name))

  store().subscribe(store_name, diff)
  return {diff, render, old_tree, new_tree}
}

let $ = (query, i, el = document) => typeof i === 'number' ? el.querySelectorAll(query)[i] : el.querySelectorAll(query)
let key = (obj, i) => obj[Object.keys(obj)[i]]
let keys = (obj) => Object.keys(obj)
