// @flow

import * as React from "react";
import { Site, Button, List, Grid } from "tabler-react";


type Props = {|
  +children: React.Node,
|};


const navBarItems: Array<navItem> = [
  {
    value: "Dashboard",
    to: "/",
    icon: "home",
    //LinkComponent: withRouter(NavLink),
    useExact: true,
  },
];

const accountDropdownProps = {
  avatarURL: "./img/user.png",
  name: "User Name",
  description: "Administrator",
  options: [
    { icon: "user", value: "Profile" },
    { icon: "log-out", value: "Sign out" , to: "/login"},
  ],
};


class SiteWrapper extends React.Component<Props, State> {

  render(): React.Node {  
    return (
      <Site.Wrapper
        headerProps={{
          href: "/",
          alt: "SySmartPlant",
          imageURL: "./img/hplant.png",
        //  accountDropdown: accountDropdownProps,
        }}
        navProps={{ itemsObjects: navBarItems }}
        //routerContextComponentType={withRouter(RouterContextProvider)}
        footerProps={{
          copyright: (
            <React.Fragment>
              Copyright © 2020
              <a href="."> SySmartPlant</a>, Cuidando da sua planta.
            </React.Fragment>
          ),
        }}
      >
        {this.props.children}
      </Site.Wrapper>
    );
  }
}

export default SiteWrapper;
