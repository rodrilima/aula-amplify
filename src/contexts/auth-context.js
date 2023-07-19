import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { authApi } from 'src/api/auth';
import { strapi } from 'src/api/strapi';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: {}
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        // if payload (user) is provided, then is authenticated
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: {}
    };
  }
};

const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;
    let user = {}

    try {
      const jwt = window.sessionStorage.getItem('sessionToken')
      if(jwt) {
        strapi.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
        const data = await authApi.me()
        isAuthenticated = !!data?.id;
        user = {
          ...data,
          avatar: `${process.env.NEXT_PUBLIC_STATIC_URL}${data.avatar.formats.thumbnail.url}`,
        };
      }
    } catch (err) {
      console.error(err);
    }

    if (isAuthenticated) {
      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE
      });
    }
  };

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signIn = async (email, password) => {
    let jwt, user;

    try {
      const response = await authApi.signIn(email, password)
      jwt = response.jwt;
    } catch(e) {
      throw new Error('Por favor, confira seu email e senha');
    }

    window.sessionStorage.setItem('sessionToken', jwt);
    strapi.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

    try {
      const data = await authApi.me()
      user = {
        ...data,
        avatar: `${process.env.NEXT_PUBLIC_STATIC_URL}${data.avatar.formats.thumbnail.url}`,
      }
    } catch(e) {}

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user
    });
  };

  const signOut = () => {
    window.sessionStorage.removeItem('sessionToken')
    strapi.defaults.headers.common['Authorization'] = null

    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
