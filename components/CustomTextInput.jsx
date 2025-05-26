import React from 'react';
import { TextInput } from 'react-native-paper';

const CustomTextInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  ...props 
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={[{ marginBottom: 10 }, style]}
      {...props}
    />
  );
};

export default CustomTextInput; 