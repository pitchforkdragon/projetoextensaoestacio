// <<INCÍCIO DE 01_LOJA.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function Loja({ onNavigateBack }) {
  // <COMPONENTES FIXOS - INÍCIO>
  const defaultLabels = {
    nome: "Nome",
    cnpj: "CNPJ/CPF",
    proprietaria: "Proprietária",
    telefone: "Telefone",
    instagram: "Instagram",
    site: "Site",
    endereço: "Endereço",
  };
  const defaultData = {
    nome: "",
    cnpj: "",
    proprietaria: "",
    telefone: "",
    instagram: "",
    site: "",
    endereço:
      "",
  };
  // <COMPONENTES FIXOS - FIM>

  //VARIÁVEIS PRIMÁRIAS
  const [newDefaultData, setNewDefaultData] = useState(defaultData);
  const [extraFields, setExtraFields] = useState([]);
  const [editingTitleIndex, setEditingTitleIndex] = useState(null);

  //BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [newButtonScale] = useState(new Animated.Value(1));
  const [deleteButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  //FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);

// <<SAVE/LOAD - INÍCIO>>
  const saveDataToStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Erro ao salvar os dados no AsyncStorage:", error);
    }
  };

  const loadDataFromStorage = async (key, defaultValue) => {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Erro ao carregar os dados do AsyncStorage:", error);
      return defaultValue;
    }
  };
  // <SAVE/LOAD - FIM>>
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
    //INICIAR DADOS ARMAZENADOS NA MEMÓRIA. NA AUSÊNCIA, RESTAURAR VALORES PADRÃO
  useEffect(() => {
    const loadData = async () => {
      const savedDefaultData = await loadDataFromStorage(
        "defaultData",
        defaultData
      );
      const savedExtraFields = await loadDataFromStorage("extraFields", []);
      setNewDefaultData(savedDefaultData);
      setExtraFields(savedExtraFields);
    };
    loadData();
  }, []);
    
    //SALVAR DADOS EDITADOS NA MEMÓRIA
  const saveData = async () => {
    await saveDataToStorage("defaultData", newDefaultData);
    await saveDataToStorage("extraFields", extraFields);
  };

  //ADICIONAR CAMPOS EXTRAS
  const addNewField = () => {
    setExtraFields([
      ...extraFields,
      { title: "*Insira texto aqui*", content: "" },
    ]);
    setEditMode(true);
  };

  //SELEÇÃO DE ITENS PARA EXCLUSÃO
  const toggleSelectForDeletion = (index) => {
    if (selectedForDeletion.includes(index)) {
      setSelectedForDeletion(
        selectedForDeletion.filter((selectedIndex) => selectedIndex !== index)
      );
    } else {
      setSelectedForDeletion([...selectedForDeletion, index]);
    }
  };

  //EXCLUSÃO DE ITENS
  const confirmDeletion = () => {
    const filteredFields = extraFields.filter(
      (_, index) => !selectedForDeletion.includes(index)
    );
    setExtraFields(filteredFields);
    setSelectedForDeletion([]);
    setDeleteMode(false);
    saveDataToStorage("extraFields", filteredFields);
    saveDataToStorage("newDefaultData", newDefaultData);
  };

  //ANIMAÇAO DOS BOTÕES
  const handleButtonPress = (buttonScale, callback) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };
  // <<IMPLEMENTAÇAO DE FUNÇÕES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  // <CABEÇALHO - INÍCIO>
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <View style={styles.titlePosition}>
          <Image source={require("../images/Logo3.png")} style={styles.logo} />
          <Text style={styles.title}>LOJA</Text>
        </View>

        {/*BOTÃO VOLTAR*/}
        <Animated.View
          style={[
            styles.backButton,
            { transform: [{ scale: backButtonScale }] },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              handleButtonPress(backButtonScale, () => onNavigateBack())
            }
          >
            <Text style={styles.backButtonText}>VOLTAR</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* <CABEÇALHO - FIM> */}

      {/* <CAMPO DOS COMPONENTES FIXOS - INÍCIO> */}
      <ScrollView contentContainerStyle={styles.marginUpDown}>
        {Object.keys(newDefaultData).map((key) => (
          <View key={key} style={styles.spaceBetweenTopics}>
            <Text style={styles.defaultTitles}>{defaultLabels[key]}</Text>
            <TextInput
              value={newDefaultData[key]}
              editable={editMode}
              multiline={key === "endereço"}
              numberOfLines={key === "endereço" ? 4 : 1}
              style={[
                styles.defaultDataSize,
                key === "endereço" && styles.adressHeight,
              ]}
              onChangeText={(text) =>
                setNewDefaultData({ ...newDefaultData, [key]: text })
              }
            />
          </View>
        ))}
        {/* <CAMPO DOS COMPONENTES FIXOS - FIM> */}

        {/* <CAMPO DOS COMPONENTES VARIÁVEIS/EXTRAS - INÍCIO> */}
        {extraFields.map((field, index) => (
          <View key={index} style={styles.spaceBetweenTopics}>
            {editingTitleIndex === index ? (
              <TextInput
                value={field.title}
                style={[
                  styles.extraFieldsEditmode,
                  {
                    fontWeight: "bold",
                    textAlign: "center",
                    fontStyle: "italic",
                  },
                ]}
                onChangeText={(text) => {
                  const updatedFields = [...extraFields];
                  updatedFields[index].title = text;
                  setExtraFields(updatedFields);
                }}
                onFocus={() => {
                  if (field.title === "*Insira texto aqui*") {
                    const updatedFields = [...extraFields];
                    updatedFields[index].title = "";
                    setExtraFields(updatedFields);
                  }
                }}
                onBlur={() => {
                  const updatedFields = [...extraFields];
                  if (updatedFields[index].title.trim() === "") {
                    updatedFields[index].title = "*Insira texto aqui*";
                  }
                  setEditingTitleIndex(null);
                  setExtraFields(updatedFields);
                }}
              />
            ) : (
              //REEDIÇÃO DE TÍTULO - CAMPOS EXTRAS - PRESSIONAR PARA EDITAR
              <TouchableOpacity onLongPress={() => setEditingTitleIndex(index)}>
                <Text style={[styles.extraFields, { textAlign: "center" }]}>
                  {field.title}
                </Text>
              </TouchableOpacity>
            )}

            {/*FUNÇÃO DE EXCLUSÃO - CAMPOS EXTRAS - SWITCH*/}
            <View style={styles.extraFieldsSize}>
              {deleteMode && (
                <Switch
                  value={selectedForDeletion.includes(index)}
                  onValueChange={() => toggleSelectForDeletion(index)}
                  style={styles.Switch}
                />
              )}

              {/*FUNÇÃO DE EDIÇAO - CAMPOS EXTRAS*/}
              <TextInput
                value={field.content}
                editable={editMode}
                multiline
                numberOfLines={10}
                style={[styles.defaultDataSize, { width: "100%" }]}
                onChangeText={(text) => {
                  const updatedFields = [...extraFields];
                  updatedFields[index].content = text;
                  setExtraFields(updatedFields);
                }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      {/* <CAMPO DOS COMPONENTES VARIÁVEIS/EXTRAS - FIM> */}

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/*LAYOUT - BOTÃO EDITAR/SALVAR*/}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/*BOTÃO EDITAR/SALVAR - INATIVO NO MODO EXCLUIR*/}
            <Button
              title={editMode ? "Salvar" : "Editar"}
              color="#333399"
              onPress={() =>
                handleButtonPress(editButtonScale, () => {
                  if (editMode) saveData();
                  setEditMode(!editMode);
                })
              }
              disabled={deleteMode}
            />
          </Animated.View>

          {/*LAYOUT - BOTÃO NOVO - INATIVO NO MODO EXCLUIR*/}
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: newButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/*BOTÃO NOVO*/}
            <Button
              title="Novo"
              color="#333399"
              onPress={() => handleButtonPress(newButtonScale, addNewField)}
              disabled={deleteMode}
            />
          </Animated.View>

          {/*LAYOUT - BOTÕES EXCLUIR*/}
        </View>
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: deleteButtonScale }] },
            ]}
          >
            {/*BOTÕES EXCLUIR*/}
            {deleteMode ? (
              <Button
                title="Excluir"
                color="red"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, confirmDeletion)
                }
              />
            ) : (
              <Button
                title="Excluir"
                color="red"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, () =>
                    setDeleteMode(true)
                  )
                }
              />
            )}
          </Animated.View>

          {/*LAYOUT - BOTÃO CANCELAR - SÓ APARECE NO MODO EXCLUSÃO*/}
          {deleteMode && (
            <Animated.View
              style={[
                styles.downbuttonsMargin,
                { transform: [{ scale: deleteButtonScale }] },
              ]}
            >
              {/*BOTÃO CANCELAR*/}
              <Button
                title="Cancelar"
                color="green"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, () =>
                    setDeleteMode(false)
                  )
                }
              />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}
// <RODAPE - FIM>
// <<INTERFACE GRÁFICA - FIM>>

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  //ESTILOS PADRÃO
  background: {
    flex: 1.0,
    backgroundColor: "#ffccff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#cc99ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    zIndex: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  titlePosition: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
  },
  backButton: {
  backgroundColor: "#333399",
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 15,
  alignSelf: "center",
},
backButtonText: {
  fontSize: 16,
  color: "#fff",
  fontWeight: "bold",
  textAlign: "center",
},
  marginUpDown: {
    padding: 85,
    paddingBottom: 120,
  },
  baseboard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    justifyContent: "center",
    backgroundColor: "#cc99ff",
    paddingHorizontal: 50,
  },
  downbuttonsDistance: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  downbuttonsMargin: {
    flex: 1,
    marginHorizontal: 10,
  },
  inactivemodeButtons: {
    opacity: 0.8,
  },

  //ESTILOS ESPECÍFICOS
  defaultTitles: {
    fontWeight: "bold",
    fontSize: 16,
  },
  defaultDataSize: {
    borderWidth: 1,
    borderColor: "#330066",
    padding: 8,
    borderRadius: 5,
    fontSize: 16,
    marginTop: 5,
    width: 300,
  },
  adressHeight: {
    height: 105,
  },
  extraFields: {
    fontWeight: "bold",
    fontSize: 16,
    alignItems: "center",
  },
  extraFieldsSize: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
  },
  extraFieldsEditmode: {
    fontWeight: "bold",
    fontSize: 16,
    alignItems: "center",
  },
  spaceBetweenTopics: {
    marginBottom: 10,
    alignItems: "center",
  },
  Switch: {
    marginTop: 8,
    marginLeft: -25,
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
});
// << ESTILOS - FIM>>

// <<FIM DE 01_LOJA.JS>>