/** @jsx kalista().dom */
'use strict'
let api_url = 'http://xyxyxy.duckdns.org:9123/api/'
// let api_url = 'https://calendar-backend-gr30n3yzz.c9users.io/api/'
let base_url = location.href
let api_endpoint_id, normal_api_endpoint_id
let __date = new Date()
store().create('state', {
  view: 0,
  message: 0,
  date: {
    day: __date.getDate(),
    month: __date.getMonth(),
    year: __date.getFullYear()
  },
  today: {
    day: __date.getDate(),
    month: __date.getMonth(),
    year: __date.getFullYear()
  },
  nav: {
    open: false,
    title: 'Day/Week/Month',
    content: [
      'Day',
      'Week',
      'Month',
      'Today'
    ]
  },
  events: []
})
let components = {
  header_tree: (state) => {
    let curr;
    if(state.view === 0){
      curr = state.date.day + "." + (state.date.month + 1) + "." + state.date.year
    } else if(state.view === 1){
      curr = (state.date.month + 1) + "." + state.date.year
    } else if(state.view === 2){
      curr = (state.date.month + 1) + "." + state.date.year
    }
    return (
      <div class="header">
        <div class="header-menu-icon" onclick="interaction().toggleNav('state')"><i class="material-icons">menu</i></div>

        <div class="header-section">{curr + " | " + state.nav.content[state.view]}</div>
      </div>
    )
  },
  nav_tree: (state) => {
    return (
      <div class={"nav-container " + (state.nav.open ? '' : 'hidden')}>
        <div class="nav">
          <div class="nav-close" onclick="interaction().toggleNav('state')"><i class="material-icons">close</i></div>
          <div class="nav-header-img"></div>
          <div class="nav-header-title">{state.nav.title}</div>
          {components.navItems_tree(state)}
          <div class="nav-bottom-buttons">
            <div class="nav-button" onclick="interaction().share()"><i class="material-icons">share</i></div>
            <div class="nav-button" onclick="syncEvents(store().get('state'), true)"><i class="material-icons">sync</i></div>
          </div>
        </div>
      </div>
    )
  },
  navItems_tree: (state) => {
    let children = []
    for(let i = 0;i < state.nav.content.length;i++){
      children.push(<div class="nav-item" onclick="interaction().changeView(this)">{state.nav.content[i]}</div>)
    }
    return (
      {'tag': 'div', 'prop': {'class': 'nav-items'}, 'children': children}
    )
  },
  view_tree: (state) => {
    let view
    if(state.view === 0){
      view = components.day_tree(state)
    } else if(state.view === 1){
      view = components.week_tree(state)
    } else if(state.view === 2){
      view = components.month_tree(state)
    }
    return (
      <div class="main">
        {components.day_tree(state)}
        {components.week_tree(state)}
        {components.month_tree(state)}
      </div>
    )
  },
  message: (state) => {
    if(typeof state.message === 'string' && state.message === 'share'){
      return (
        <div class="bg-dim">
          <div class="message-box">
            <div class="message-text">copy this link:</div>
            <br />
            <div class="message-link">{base_url + '#' + localStorage.getItem('api_endpoint_id')}</div>
            <div class="message-button message-button-full" onclick="interaction().closeMessage()">Done</div>
          </div>
        </div>
      )
    } else if (typeof state.message === 'string' && state.message === 'add'){
      return (
        <div class="bg-dim">
          <div class="message-box">
            <div class="message-text">name:</div>
            <input class="message-input event-set-name" type="text" placeholder="Set name..."></input>
            <div class="message-text">year:</div>
            <input class="message-input event-set-year" type="number" placeholder="Set year..." value={state.date.year}></input>
            <div class="message-text">month:</div>
            <input class="message-input event-set-month" type="number" placeholder="Set month..." value={state.date.month + 1}></input>
            <div class="message-text">day:</div>
            <input class="message-input event-set-day" type="number" placeholder="Set day..." value={state.date.day}></input>
            <div class="message-text">hour:</div>
            <input class="message-input event-set-hour" type="number" placeholder="Set hour..."></input>
            <div class="message-button message-button-half btn-secondary" onclick="interaction().closeMessage()">Cancel</div>
            <div class="message-button message-button-half btn-primary" onclick="interaction().addEvent(this)">Save</div>
          </div>
        </div>
      )
    } else if(typeof state.message === 'string' && state.message.indexOf('event') === 0) {
      let l_id = state.message.substring(6, state.message.length)
      let l_event = getEventById(l_id).event
      return (
        <div class="bg-dim">
          <div class="message-box">
            <div class="message-text">title:</div>
            <input class="message-input event-set-name" type="text" placeholder="Change title..." value={l_event.title}></input>
            <div class="message-text">year:</div>
            <input class="message-input event-set-year" type="text" placeholder="Change year..." value={l_event.date.year}></input>
            <div class="message-text">month:</div>
            <input class="message-input event-set-month" type="text" placeholder="Change month..." value={l_event.date.month + 1}></input>
            <div class="message-text">day:</div>
            <input class="message-input event-set-day" type="text" placeholder="Change day..." value={l_event.date.day}></input>
            <div class="message-text">hour:</div>
            <input class="message-input event-set-hour" type="text" placeholder="Change hour..." value={l_event.date.hour}></input>
            <div class="message-button-fab btn-primary" onclick={'removeEvent("' + l_id + '")'}><i class="material-icons">delete</i></div>
            <div class="message-button message-button-half btn-secondary" onclick="interaction().closeMessage()">Cancel</div>
            <div class="message-button message-button-half btn-primary" onclick={'interaction().addEvent(this, "' + l_id + '")'}>Save</div>
          </div>
        </div>
      )
    } else {
      return <div></div>
    }
  },
  main_tree: (state) => {
    return (
      <div>
        {components.header_tree(state)}
        {components.nav_tree(state)}
        {components.view_tree(state)}
        {components.buttons()}
        {components.message(state)}
      </div>
    )
  },
  day_tree: (state) => {
    let evt = events(state, state.date), children = []
    for(let i = 0; i < 24; i ++){
      let _i = i, _event = false, _title = '', _id =  ''
      for(let e = 0;e < evt.length;e++){
        if(i === evt[e].hour){
          _event = true
          _title = evt[e].title
          _id = evt[e].id
        }
      }
      if(i === 24){
        _i = 0
      }
      children.push(<div class="day-container" onclick={_event && _id !== '' ? 'interaction().changeEvent("' + _id +'")' : ''}><div class="day-time">{_i}:00</div><div class="day-event" event={_event}>{_title}</div></div>)
    }
    return {'tag': 'div', 'prop': {'class': 'day-view ', 'hide': (state.view === 0 || state.view === 3) ? false : true}, 'children': children}
  },
  week_tree: (state) => {
    let date = new Date(state.date.year, state.date.month, state.date.day)
    while(date.getDay() !== 1){
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
    }
    let dates = [
      date,
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 4),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 5),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
    ]
    let titles = []
    let isToday = []
    for(let i = 0;i < dates.length;i++){
      if(dates[i].getDate() === state.today.day && dates[i].getMonth() === state.today.month && dates[i].getFullYear() === state.today.year){
        isToday[i] = true
      } else {
        isToday[i] = false
      }
      let title = []
      let evt = events(state, {'year': dates[i].getFullYear(), 'month': dates[i].getMonth(), 'day': dates[i].getDate()})
      for(let e=0;e<evt.length;e++){
        title.push(<div class="event-badge">{evt[e].title}</div>)
      }
      titles.push({'tag': 'div', 'children': title})
    }
    return (
      <div class={"week-view "} hide={(state.view === 1) ? false : true}>
        <table>
          <tr>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
            <th>S</th>
          </tr>
          <tr class="isWeek">
            <td is_today={isToday[0]} week_date onclick="interaction().viewDay(this)">{dates[0].getDate() + "." + (dates[0].getMonth() + 1)}</td>
            <td is_today={isToday[1]} week_date onclick="interaction().viewDay(this)">{dates[1].getDate() + "." + (dates[1].getMonth() + 1)}</td>
            <td is_today={isToday[2]} week_date onclick="interaction().viewDay(this)">{dates[2].getDate() + "." + (dates[2].getMonth() + 1)}</td>
            <td is_today={isToday[3]} week_date onclick="interaction().viewDay(this)">{dates[3].getDate() + "." + (dates[3].getMonth() + 1)}</td>
            <td is_today={isToday[4]} week_date onclick="interaction().viewDay(this)">{dates[4].getDate() + "." + (dates[4].getMonth() + 1)}</td>
            <td is_today={isToday[5]} week_date onclick="interaction().viewDay(this)">{dates[5].getDate() + "." + (dates[5].getMonth() + 1)}</td>
            <td is_today={isToday[6]} week_date onclick="interaction().viewDay(this)">{dates[6].getDate() + "." + (dates[6].getMonth() + 1)}</td>
          </tr>
          <tr>
            <td event={titles[0] ? true : false}>{titles[0]}</td>
            <td event={titles[1] ? true : false}>{titles[1]}</td>
            <td event={titles[2] ? true : false}>{titles[2]}</td>
            <td event={titles[3] ? true : false}>{titles[3]}</td>
            <td event={titles[4] ? true : false}>{titles[4]}</td>
            <td event={titles[5] ? true : false}>{titles[5]}</td>
            <td event={titles[6] ? true : false}>{titles[6]}</td>
          </tr>
        </table>
      </div>
    )
  },
  month_tree: (state) => {
    let weeks = getMonthData(state.date.year, state.date.month)
    let obj = []
    let isToday = false
    for(let i=0;i<weeks.length;i++){
      let children = []
      for(let x=0;x<weeks[i].length;x++){
        let l_data
        if(weeks[i][x] === undefined){
          l_data = ''
        } else {
          l_data = weeks[i][x]
        }
        if(l_data === state.today.day && state.date.month === state.today.month && state.date.year === state.today.year){
          isToday = true
        } else {
          isToday = false
        }
        children.push(<td class="month-item" is_today={isToday} onclick={'interaction().viewDay(this, ' + state.date.month + ')'}>{l_data}</td>)
      }
      obj.push({'tag': 'tr', 'prop': {'class': 'month-row'}, 'children': children})
    }
    let m_data = {'tag': 'table', 'prop': {'class': ''}, 'children': obj}
    return (
      <div class="month-view" hide={(state.view === 2) ? false : true}>
        <table>
          <tr>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
            <th>S</th>
          </tr>
        </table>
        {m_data}
      </div>
    )
  },
  buttons: (state) => {
    return (
      <div class="btn-container">
        <div class="btn-previous btn-fab" onclick="interaction().previous()"><i class="material-icons">keyboard_arrow_left</i></div>
        <div class="btn-next btn-fab" onclick="interaction().next()"><i class="material-icons">keyboard_arrow_right</i></div>
        <div class="btn-add btn-fab" onclick='interaction().add({"date":{"year":2016,"month":4,"day":26,"hour":8},"title":"test event"})'><i class="material-icons">add</i></div>
      </div>
    )
  },
  add_screen: (state) => {
    let add_menu = (
      <div class="add_menu">

      </div>
    )
  }
}

let interaction = () => {
  return {
    toggleNav: (state) => {
      if(store().get(state).nav.open){
        let state = store().get('state')
        state.nav.open = false
        store().change('state', state)
      } else {
        let state = store().get('state')
        state.nav.open = true
        store().change('state', state)
      }
    },
    changeView: (that) => {
      let state = store().get('state')
      if(that.innerHTML === 'Today'){
        state.date = {'year': new Date().getFullYear(), 'month': new Date().getMonth(), 'day': new Date().getDate()}
        state.view = 0
      } else {
        state.view = state.nav.content.indexOf(that.innerHTML)
      }
      state.nav.open = false
      store().change('state', state)
    },
    viewDay: (that, month) => {
      let state = store().get('state'), year = state.date.year, day_month
      if(month){
        day_month = [that.innerHTML, month + 1]
      } else {
        day_month = that.innerHTML.split(".")
      }
      state.date = { 'year': year, 'month': parseInt(day_month[1]) - 1, 'day': parseInt(day_month[0])}
      state.view = 0
      store().change('state', state)
    },
    previous: () => {
      let state = store().get('state'), _date
      switch (state.view) {
        case 0:
          _date = new Date(state.date.year, state.date.month, state.date.day - 1)
          state.date.day = _date.getDate()
          state.date.month = _date.getMonth()
          state.date.year = _date.getFullYear()
          store().change('state', state)
          break;
        case 1:
        _date = new Date(state.date.year, state.date.month, state.date.day - 7)
        state.date.day = _date.getDate()
        state.date.month = _date.getMonth()
        state.date.year = _date.getFullYear()
        store().change('state', state)
          break;
        case 2:
        _date = new Date(state.date.year, state.date.month - 1, state.date.day)
        state.date.day = _date.getDate()
        state.date.month = _date.getMonth()
        state.date.year = _date.getFullYear()
        store().change('state', state)
          break;
        default:
          console.log('error')
      }
    },
    next: () => {
      let state = store().get('state'), _date
      switch (state.view) {
        case 0:
          _date = new Date(state.date.year, state.date.month, state.date.day + 1)
          state.date.day = _date.getDate()
          state.date.month = _date.getMonth()
          state.date.year = _date.getFullYear()
          store().change('state', state)
          break;
        case 1:
          _date = new Date(state.date.year, state.date.month, state.date.day + 7)
          state.date.day = _date.getDate()
          state.date.month = _date.getMonth()
          state.date.year = _date.getFullYear()
          store().change('state', state)
          break;
        case 2:
        _date = new Date(state.date.year, state.date.month + 1, state.date.day)
        state.date.day = _date.getDate()
        state.date.month = _date.getMonth()
        state.date.year = _date.getFullYear()
        store().change('state', state)
          break;
        default:
          console.log('error')
      }
    },
    add: () => {
      let l_state = store().get('state')
      l_state.message = 'add'
      store().change('state', l_state)
    },
    addEvent: (that, id = gen_random()) => {
      let l_state = store().get('state')
      let l_event = {
        date: {
          year: parseInt($('.event-set-year', 0, that.parentNode).value),
          month: parseInt($('.event-set-month', 0, that.parentNode).value) - 1,
          day: parseInt($('.event-set-day', 0, that.parentNode).value),
          hour: parseInt($('.event-set-hour', 0, that.parentNode).value),
        },
        title: $('.event-set-name', 0, that.parentNode).value,
        id: id
      }
      if(getEventById(id)){
      l_state.events[getEventById(id).i] = l_event
      } else {
        l_state.events.push(l_event)
      }
      syncEvents(l_state, false)
      interaction().closeMessage()
    },
    share: () => {
      let l_state = store().get('state')
      l_state.message = 'share'
      l_state.nav.open = false
      store().change('state', l_state)
    },
    closeMessage: () => {
      let l_state = store().get('state')
      l_state.message = 0
      store().change('state', l_state)
    },
    changeEvent: (id) => {
      let l_state = store().get('state')
      l_state.message = 'event.' + id
      store().change('state', l_state)
    }
  }
}
let events = (state, date) => {
  let _events = []
  for(let i = 0;i < state.events.length;i++){
    let date2 = state.events[i].date
    if(date.year === date2.year && date.month === date2.month && date.day === date2.day){
      _events.push({
        'hour': date2.hour,
        'title': state.events[i].title,
        'id': state.events[i].id
      })
    }
  }
  return _events
}
let getMonthData = (year, month) => {
  let date = new Date(year, month, 1), date2, days = [], weeks = [], curr_week = 0
  while(date.getMonth() === month){
    date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    let day = date.getDay() - 2
    if(day === -2){
      day = 5
    } else if(day === -1){
      day = 6
    }
    days.push({'date': date2.getDate(), 'day': day})
  }
  for(let i = 0; i < days.length;i++){
    if(!weeks[curr_week]){
      weeks[curr_week] = []
    }
    if(days[i].day < Math.floor(i - curr_week * 7)){
      curr_week++
      if(!weeks[curr_week]){
        weeks[curr_week] = []
      }
      weeks[curr_week][days[i].day] = days[i].date
    } else {
    weeks[curr_week][days[i].day] = days[i].date
    }
  }
  return weeks
}

let getEventById = (id) => {
  let l_events = store().get('state').events
  for(let i=0;i<l_events.length;i++){
    if(l_events[i].id === id){
      return {event: l_events[i], i: i}
    }
  }
}

let sortEvents = () => {
  let state = store().get('state')
  state.events.sort((a, b) => {
    return (a.date.hour > b.date.hour) ? 1: ((b.hour > a.hour) ? -1 : 0)
  })
  store().change('state', state)
}

let getEvents = () => {
  let http = new XMLHttpRequest()
  if(typeof(Storage) !== 'undefined'){
    if(localStorage.getItem('api_endpoint_id')){
      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
          let l_state = store().get('state')
          if(JSON.parse(http.response)[0] !== 'offline'){
            l_state.events = JSON.parse(http.response)
            store().change('state', l_state)
          }
        }
      };
      http.open('GET', api_url + localStorage.getItem('api_endpoint_id'), true)
      http.send()
    } else {
      console.log('no api_endpoint_id')
      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
         localStorage.setItem('api_endpoint_id', http.responseText)
        }
      };
      http.open('GET', api_url + 'new', true)
      http.send()
    }
  }
}

let removeEvent = (id) => {
  let l_state = store().get('state')
  for(let i=0;i < l_state.events.length;i++){
    if(l_state.events[i].id === id) l_state.events.splice(i, 1)
  }
  interaction().closeMessage()
  syncEvents(l_state, false)
}

let syncEvents = (state, toast) => {
  let http = new XMLHttpRequest()
  http.onreadystatechange = function() {
    if(http.readyState === 4 && http.status === 200){
      state.events = JSON.parse(http.responseText)
      if(toast === true) showToast('synchronized', 700)
      store().change('state', state)
      sortEvents()
    }
  }
  http.open('POST', api_url + localStorage.getItem('api_endpoint_id'), true)
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  http.send('key=' + JSON.stringify(state.events))

}

let sharedMode = () => {
  if(location.hash.length === 25){
    let l_hash = location.hash.substring(1, location.hash.length)
    api_endpoint_id = l_hash
    normal_api_endpoint_id = localStorage.getItem('api_endpoint_id')
    localStorage.setItem('normal_api_endpoint_id', normal_api_endpoint_id)
    localStorage.setItem('api_endpoint_id', l_hash)
    console.log(l_hash, normal_api_endpoint_id)
  } else if(localStorage.getItem('normal_api_endpoint_id')){
    localStorage.setItem('api_endpoint_id', localStorage.getItem('normal_api_endpoint_id'))
    localStorage.removeItem('normal_api_endpoint_id')
  }
}

let showToast = (toast, duration) => {
  let l_el = document.createElement('div')
  l_el.classList.add('toast')
  l_el.innerText = toast
  renderTarget.appendChild(l_el)
  setTimeout(() => {
    renderTarget.removeChild(l_el)
  }, duration)
}

let gen_random = () => {
  return Math.random().toString(36).substring(2,18)
}

let renderTrees = []
let renderTarget = $('body', 0)

let render = (state) => {
  renderTrees = []
  renderTrees[0] = kalista().gen_id(components.main_tree(state))
  renderTarget.replaceChild(kalista().render(renderTrees[0]), renderTarget.firstChild)
}
let diff = (state) => {
  let i = renderTrees.length - 1
  renderTrees[i + 1] = kalista().diff(renderTrees[i], kalista().gen_id(components.main_tree(state)), renderTarget).newRenderTree
}
$('.header')[0].remove()
sharedMode()
getEvents()
sortEvents()
render(store().get('state'))

store().subscribe('state', diff)
