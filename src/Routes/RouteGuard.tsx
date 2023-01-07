import React from 'react';
import { Navigate,  PathRouteProps} from 'react-router-dom';
import { isLoggedIn } from '../Utils/AuthServise';

interface Props extends PathRouteProps {
  isPrivate?: boolean;
}


const RouteGuard: React.FC<Props> = ({ children }: Props) => {

  return   isLoggedIn() && children ? <> {children} </> : <Navigate to="/login" />
   
};

RouteGuard.defaultProps = {
  isPrivate: true,
};

export default  RouteGuard ;