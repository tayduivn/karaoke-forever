import PropTypes from 'prop-types'
import React from 'react'
import Swipeable from 'react-swipeable'
import Icon from 'components/Icon'
import './SongItem.css'

const BTN_WIDTH = 44

export default class SongItem extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    style: PropTypes.object,
    onSongClick: PropTypes.func.isRequired,
    onSongStarClick: PropTypes.func.isRequired,
    isQueued: PropTypes.bool.isRequired,
    isStarred: PropTypes.bool.isRequired,
    numStars: PropTypes.number.isRequired,
    numMedia: PropTypes.number.isRequired,
  }

  state = {
    expanded: false,
  }

  handleSwipingLeft = (e, delta) => {
    this.setState({ expanded: true })
  }

  handleSwipingRight = (e, delta) => {
    this.setState({ expanded: false })
  }

  render () {
    const { props } = this

    return (
      <Swipeable
        onSwipingLeft={this.handleSwipingLeft}
        onSwipingRight={this.handleSwipingRight}
        preventDefaultTouchmoveEvent
        style={props.style}
        styleName={'container' + (props.isQueued ? ' isQueued' : '')}
      >
        <div styleName='duration'>
          {toMMSS(props.duration)}
        </div>

        <div onClick={props.onSongClick} styleName='title'>
          {props.title}
          {props.numMedia > 1 &&
            <i> ({props.numMedia})</i>
          }
        </div>

        <div styleName='btnContainer'
          style={{ width: this.state.expanded ? BTN_WIDTH * 4 + 'px' : BTN_WIDTH + 'px' }}
        >
          <div onClick={props.onSongStarClick} styleName='button'>
            <Icon size={44} icon={'STAR_FULL'}
              styleName={props.isStarred ? 'starStarred' : 'star'}
            />
            <div styleName={props.isStarred ? 'starCountStarred' : 'starCount'}>{props.numStars}</div>
          </div>
          <div onClick={props.onSongStarClick} styleName='button'>
            <Icon size={44} icon='INFO_OUTLINE' />
          </div>
          <div onClick={props.onSongStarClick} styleName='button'>
            <Icon size={44} icon='FLAG' />
          </div>
          <div onClick={props.onSongStarClick} styleName='button'>
            <Icon size={44} icon='DELETE' />
          </div>
        </div>
      </Swipeable>
    )
  }
}

// convert seconds to mm:ss
function toMMSS (duration) {
  const min = Math.floor(duration / 60)
  const sec = duration - (min * 60)
  return min + ':' + (sec < 10 ? '0' + sec : sec)
}
