import PropTypes from 'prop-types'
import React from 'react'
import Measure from 'react-measure'
import PlaybackCtrl from './PlaybackCtrl'
import ProgressBar from './ProgressBar'
import UpNext from './UpNext'
import LibraryHeader from 'routes/Library/components/LibraryHeader'
import PlayerHeader from 'routes/Player/components/PlayerHeader'
import './Header.css'

const Header = (props) => {
  const { isPlayer, isPlayerPresent, isUpNext, isUpNow, isAdmin, loc } = props

  return (
    <Measure onMeasure={props.headerHeightChange} whitelist={['height']}>
      <div styleName='container' className='bg-blur'>
        {!isPlayer && isPlayerPresent && (isUpNow || isUpNext) &&
          <UpNext isUpNext={isUpNext} isUpNow={isUpNow} wait={props.wait} />
        }

        {(isUpNow || isAdmin) &&
          <PlaybackCtrl />
        }

        {isAdmin && props.isUpdating &&
          <ProgressBar
            text={props.updateText}
            progress={props.updateProgress}
            onCancel={props.requestScanCancel}
          />
        }

        {/^\/library/.test(loc) && <LibraryHeader/>}
        {/^\/player/.test(loc) && <PlayerHeader/>}
      </div>
    </Measure>
  )
}

Header.propTypes = {
  children: PropTypes.node,
  isAdmin: PropTypes.bool.isRequired,
  isPlayer: PropTypes.bool.isRequired,
  isPlayerPresent: PropTypes.bool.isRequired,
  isUpNext: PropTypes.bool.isRequired,
  isUpNow: PropTypes.bool.isRequired,
  wait: PropTypes.number.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  updateText: PropTypes.string.isRequired,
  updateProgress: PropTypes.number.isRequired,
  loc: PropTypes.string.isRequired,
  // actions
  headerHeightChange: PropTypes.func.isRequired,
  requestScanCancel: PropTypes.func.isRequired,
}

export default Header
