// <<INCÍCIO DE LOADINGSCREEN.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet } from "react-native";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function LoadingScreen({ onLoadingComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
  //ANIMAÇÃO DE ABERTURA DO APLICATIVO>>
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          onLoadingComplete();
        });
      }, 1000);
    });
  }, [fadeAnim, onLoadingComplete]);
  // <<IMPLEMENTAÇAO DE FUNÇÕES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require("../images/Logo1.png")} style={styles.logo} />
      </Animated.View>
    </View>
  );
}
// <<INTERFACE GRÁFICA - FIM>>

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffccff",
  },
  logo: {
    width: 300,
    height: 70,
  },
});
// <<ESTILOS - FIM>>

// <<FIM DE LOADINGSCREEN.JS>>
