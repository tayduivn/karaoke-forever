import React, { PropTypes } from 'react'
import Login from 'components/Login'
import Logout from 'components/Logout'
import AccountForm from '../components/AccountForm'

export class AccountView extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    loginUser: PropTypes.func.isRequired,
    logoutUser: PropTypes.func.isRequired,
    createUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired
  }

  state = {
    viewMode: 'login' // default
  }

  render () {
    const {user, loginUser, logoutUser, createUser, updateUser} = this.props
    let viewMode = user.isAuthenticated ? 'edit' : this.state.viewMode

    return (
      <div className='container'>
        <h1>Account</h1>
        {viewMode === 'login' &&
          <div>
            <p>Sign in below or <a onClick={() => this.setState({viewMode: 'create'})}>create a new account</a>.</p>
            <Login onSubmitClick={ creds => loginUser(creds) } />
          </div>
        }

        {viewMode === 'create' &&
          <div>
            <p>Create an account or <a onClick={() => this.setState({viewMode: 'login'})}>sign in with an existing one</a>.</p>
            <AccountForm
              onSubmitClick={createUser}
              viewMode={viewMode}
            />
          </div>
        }

        {viewMode === 'edit' &&
          <div>
            <p>You may edit any account information here.</p>
            <AccountForm
              defaultName={user.name}
              defaultEmail={user.email}
              viewMode={viewMode}
              onSubmitClick={updateUser}
            />
          </div>
        }

        {user.errorMessage &&
          <p style={{color:'red'}}>{user.errorMessage}</p>
        }

        {user.isAuthenticated &&
          <Logout
            onLogoutClick={ () => logoutUser() }
          />
        }
      </div>
    )
  }
}

export default AccountView