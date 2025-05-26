import React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';

const CustomButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  mode = 'contained',
  style,
  ...props 
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={loading || disabled}
      style={[{ marginTop: 10 }, style]}
      {...props}
    >
      {loading ? <ActivityIndicator color="#fff" /> : title}
    </Button>
  );
};

export default CustomButton; 