import {
  LIBRARY_SEARCH,
  LIBRARY_CHANGE_VIEW,
  TOGGLE_ARTIST_EXPANDED,
} from 'constants/actions'

export function changeView (view) {
  return {
    type: LIBRARY_CHANGE_VIEW,
    payload: view,
  }
}

const SCROLL_ARTISTS = 'library/SCROLL_ARTISTS'
export function scrollArtists (scrollTop) {
  return {
    type: SCROLL_ARTISTS,
    payload: scrollTop,
  }
}

export function toggleArtistExpanded (artistId) {
  return {
    type: TOGGLE_ARTIST_EXPANDED,
    payload: artistId,
  }
}

const ARTIST_RESULT_EXPAND_TOGGLE = 'library/ARTIST_RESULT_EXPAND_TOGGLE'
export function toggleArtistResultExpanded (artistId) {
  return {
    type: ARTIST_RESULT_EXPAND_TOGGLE,
    payload: artistId,
  }
}

export function searchLibrary (str) {
  return {
    type: LIBRARY_SEARCH,
    payload: str,
    meta: {
      throttle: {
        wait: 300,
        leading: false,
      }
    },
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LIBRARY_SEARCH]: (state, { payload }) => ({
    ...state,
    searchStr: payload,
    view: 'all',
  }),
  [LIBRARY_CHANGE_VIEW]: (state, { payload }) => ({
    ...state,
    view: payload,
  }),
  [SCROLL_ARTISTS]: (state, { payload }) => ({
    ...state,
    scrollTop: payload,
  }),
  [TOGGLE_ARTIST_EXPANDED]: (state, { payload }) => {
    let list = state.expandedArtists.slice()
    const i = list.indexOf(payload)
    i === -1 ? list.push(payload) : list.splice(i, 1)

    return {
      ...state,
      expandedArtists: list,
    }
  },
  [ARTIST_RESULT_EXPAND_TOGGLE]: (state, { payload }) => {
    let list = state.expandedArtistResults.slice()
    const i = list.indexOf(payload)

    if (i === -1) {
      list.push(payload)
    } else {
      list.splice(i, 1)
    }

    return {
      ...state,
      expandedArtistResults: list,
    }
  },
}

// ------------------------------------
// Reducer
// ------------------------------------
let initialState = {
  searchStr: '',
  view: 'all',
  artistSearchResult: [],
  songSearchResult: [],
  scrollTop: 0,
  expandedArtists: [],
  expandedArtistResults: [],
}

export default function libraryReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
