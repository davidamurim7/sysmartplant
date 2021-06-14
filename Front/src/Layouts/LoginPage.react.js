// @flow

import * as React from "react";

import {
  FormCard,
  FormTextInput,
  StandaloneFormPage,
  FormEvents,
  FocusEvents,
} from "tabler-react";

type fieldTypes = {|
  email?: string,
  password?: string,
|};

type touchedTypes = {|
  email?: boolean,
  password?: boolean,
|};

type Props = {|
  ...FormEvents,
  ...FocusEvents,
  +strings?: stringTypes,
  +action?: string,
  +method?: string,
  +values?: fieldTypes,
  +errors?: fieldTypes,
  +touched?: touchedTypes,
|};

/**
 * A login page
 * Can be easily wrapped with form libraries like formik and redux-form
 */
function LoginPage(props: Props): React.Node {
  const {
    action,
    method,
    onSubmit,
    onChange,
    onBlur,
    values,
    strings = {},
    errors,
  } = props;

  return (
    <StandaloneFormPage imageURL={"./img/hplant.png"}>
      <FormCard
        buttonText={"Entrar"}
        title={"Login"}
        //onSubmit={onSubmit}
        action={"/"}
        method={"GET"}
      >
        <FormTextInput
          name="email"
          label={"Email"}
          placeholder={
            "Digite seu email..."
          }
          onChange={onChange}
          onBlur={onBlur}
          value={values && values.email}
          error={errors && errors.email}
        />
        <FormTextInput
          name="password"
          type="password"
          label={"Senha"}
          placeholder={
            "Digite sua senha..."
          }
          onChange={onChange}
          onBlur={onBlur}
          value={values && values.password}
          error={errors && errors.password}
        />
      </FormCard>
    </StandaloneFormPage>
  );
}

export default LoginPage;