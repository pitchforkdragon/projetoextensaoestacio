// <<INÍCIO DE 06_CAIXA.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇÃO DE COMPONENTES - INÍCIO>>
export default function Caixa({ onNavigateBack }) {
  // VARIÁVEIS PRIMÁRIAS
  const [capitalGiro, setCapitalGiro] = useState(0);
  const [capitalGiroInputValue, setCapitalGiroInputValue] = useState("");
  const [reservas, setReservas] = useState(0);
  const [reservasInputValue, setReservasInputValue] = useState("");
  const [transferInputValue, setTransferInputValue] = useState("");
  const [gastos, setGastos] = useState([]);

  // BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [newButtonScale] = useState(new Animated.Value(1));
  const [deleteButtonScale] = useState(new Animated.Value(1));
  const [editCaixaButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  // FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);
  const [editCaixaMode, setEditCaixaMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [restartPreserve, setRestartPreserve] = useState(false);
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
  // INICIAR DADOS ARMAZENADOS DO CAPITAL DE GIRO, RESERVAS E LISTA DE GASTOS
  useEffect(() => {
    const loadData = async () => {
      const storedCapitalGiro =
        parseFloat(await AsyncStorage.getItem("capitalGiro")) || 0;
      const storedReservas =
        parseFloat(await AsyncStorage.getItem("reservas")) || 0;
      const storedGastos =
        JSON.parse(await AsyncStorage.getItem("gastos")) || [];
      setCapitalGiro(storedCapitalGiro);
      setReservas(storedReservas);
      setGastos(storedGastos);
    };
    loadData();
  }, []);

  // SALVAR EM TEMPO REAL TODAS AS ALTERAÇÕES DE CAIXA
  useEffect(() => {
    const saveData = async () => {
      await AsyncStorage.setItem("gastos", JSON.stringify(gastos));
      await AsyncStorage.setItem("capitalGiro", capitalGiro.toString());
      await AsyncStorage.setItem("reservas", reservas.toString());
    };
    saveData();
  }, [gastos, capitalGiro, reservas]);

  // CHAMA O FORMATO MOEDA QUANDO APLICADO
  function formatCurrency(value) {
    if (value === "" || isNaN(value)) return "R$ 0,00";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // DEFINE O FORMATO MOEDA EM MODO EDIÇÃO, PARA EVITAR INPUTs INCOERENTES
  function formatCurrencyInput(value) {
    // PERMITE SOMENTE NÚMEROS, VÍRGULA E SINAL DE MENOS
    let newValue = value.replace(/[^0-9,-]/g, "");
    // RESTRINGE A APENAS UMA VÍRGULA
    const parts = newValue.split(",");
    if (parts.length > 2) {
      newValue = parts[0] + "," + parts[1];
    }
    // RESTRINGE A APENAS UM SINAL DE MENOS
    newValue = newValue.replace(/(?!^)-/g, "");
    // RESTRINGE CENTAVOS A DOIS DIGITOS
    if (newValue.includes(",")) {
      const [integerPart, decimalPart] = newValue.split(",");
      newValue = integerPart + "," + decimalPart.substring(0, 2);
    }
    return newValue;
  }

  // ADICIONA UM NOVO GASTO
  const addGasto = () => {
    setGastos([{ descricao: "", valor: "", id: Date.now() }, ...gastos]);
    setEditMode(true);
  };

  // EDITA GASTOS REALIZADOS, SE CERTIFICANDO DE QUE SEJAM ATUALIZADOS NO CAPITAL DE GIRO
  const updateGasto = (index, field, value) => {
    const updatedGastos = [...gastos];
    if (field === "valor") {
      const prevValue =
        parseFloat(
          (updatedGastos[index].valor || "0").replace(".", "").replace(",", ".")
        ) || 0;
      const newValue =
        parseFloat(value.replace(".", "").replace(",", ".")) || 0;
      const difference = newValue - prevValue;
      updatedGastos[index][field] = value;
      setGastos(updatedGastos);
      if (!updatedGastos[index].isTransfer) {
        setCapitalGiro(
          (prevCapitalGiro) =>
            Math.round((prevCapitalGiro + difference) * 100) / 100
        );
      }
    } else {
      updatedGastos[index][field] = value;
      setGastos(updatedGastos);
    }
  };
  const capitalGiroDisponivel = capitalGiro;

  // HABILITA A TRANSFERÊNCIA DE VALORES ENTRE O CAPITAL DE GIRO E A RESERVA DE CAPITAL
  const transferirValor = (direction) => {
    const valorStr = formatCurrencyInput(transferInputValue);
    const valor = parseFloat(valorStr.replace(".", "").replace(",", ".")) || 0;
    if (isNaN(valor) || valor === 0) {
      return;
    }
    if (direction === "toReservas") {
      if (valor > capitalGiroDisponivel) {
        Alert.alert("Erro", "Saldo insuficiente no capital de giro.");
        return;
      }
      const newCapitalGiro = Math.round((capitalGiro - valor) * 100) / 100;
      const newReservas = Math.round((reservas + valor) * 100) / 100;
      setCapitalGiro(newCapitalGiro);
      setReservas(newReservas);
      // ADICIONA NA LISTA DE GASTOS A TRANSFERÊNCIA REALIZADA DO CAPITAL DE GIRO PARA A RESERVA DE CAPITAL
      const newGasto = {
        descricao: "Transferência: Giro → Reserva",
        valor: valorStr,
        id: Date.now(),
        isTransfer: true,
        direction: "GiroToReserva",
      };
      setGastos([newGasto, ...gastos]);
    } else if (direction === "toCapitalGiro") {
      if (valor > reservas) {
        Alert.alert("Erro", "Saldo insuficiente nas reservas.");
        return;
      }
      const newCapitalGiro = Math.round((capitalGiro + valor) * 100) / 100;
      const newReservas = Math.round((reservas - valor) * 100) / 100;
      setCapitalGiro(newCapitalGiro);
      setReservas(newReservas);
      // ADICIONA NA LISTA DE GASTOS A TRANSFERÊNCIA REALIZADA DA RESERVA DE CAPITAL PARA O CAPITAL DE GIRO
      const newGasto = {
        descricao: "Transferência: Reserva → Giro",
        valor: valorStr,
        id: Date.now(),
        isTransfer: true,
        direction: "ReservaToGiro",
      };
      setGastos([newGasto, ...gastos]);
    }
    setTransferInputValue("");
  };

  // METODOLOGIA DE EDIÇÃO MANUAL DO CAPITAL DE GIRO E RESERVA DE CAPITAL
  const handleEditCaixaToggle = () => {
    if (editCaixaMode) {
      // Salvar alterações no AsyncStorage
      AsyncStorage.setItem("capitalGiro", capitalGiro.toString());
      AsyncStorage.setItem("reservas", reservas.toString());
    } else {
      setCapitalGiroInputValue(capitalGiro.toString().replace(".", ","));
      setReservasInputValue(reservas.toString().replace(".", ","));
    }
    setEditCaixaMode(!editCaixaMode);
  };

  // SELEÇÃO DE TODOS OS ITENS PARA APAGAR A LISTA DE GASTOS SEM ALTERAR O CAPITAL DE GIRO
  const toggleRestartPreserve = () => {
    if (restartPreserve) {
      setSelectedForDeletion([]);
      setRestartPreserve(false);
    } else {
      const allIds = gastos.map((gasto) => gasto.id);
      setSelectedForDeletion(allIds);
      setRestartPreserve(true);
    }
  };

  // SELEÇÃO DE ITENS PARA EXCLUSÃO
  const toggleSelectForDeletion = (id) => {
    setSelectedForDeletion((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // EXCLUSÃO DE ITENS DA LISTA DE GASTOS, ATUALIZANDO O CAPITAL DE GIRO APÓS EXCLUSÃO
  const confirmDeletion = () => {
    if (restartPreserve) {
      setGastos([]);
      setSelectedForDeletion([]);
      setDeleteMode(false);
      setRestartPreserve(false);
      AsyncStorage.setItem("gastos", JSON.stringify([]));
    } else {
      const gastosToDelete = gastos.filter((gasto) =>
        selectedForDeletion.includes(gasto.id)
      );
      let adjustedCapitalGiro = capitalGiro;
      let adjustedReservas = reservas;
      gastosToDelete.forEach((gasto) => {
        const valor =
          parseFloat((gasto.valor || "0").replace(".", "").replace(",", ".")) ||
          0;
        if (gasto.isTransfer) {
          // MOVIMENTAÇÃO DE CONTA
          if (gasto.direction === "GiroToReserva") {
            adjustedCapitalGiro =
              Math.round((adjustedCapitalGiro + valor) * 100) / 100;
            adjustedReservas =
              Math.round((adjustedReservas - valor) * 100) / 100;
          } else if (gasto.direction === "ReservaToGiro") {
            adjustedCapitalGiro =
              Math.round((adjustedCapitalGiro - valor) * 100) / 100;
            adjustedReservas =
              Math.round((adjustedReservas + valor) * 100) / 100;
          }
        } else {
          adjustedCapitalGiro =
            Math.round((adjustedCapitalGiro - valor) * 100) / 100;
        }
      });
      setCapitalGiro(adjustedCapitalGiro);
      setReservas(adjustedReservas);
      // ATUALIZAR LISTA DE GASTOS, CAPITAL DE GIRO E RESERVA DE CAPITAL
      const updatedGastos = gastos.filter(
        (gasto) => !selectedForDeletion.includes(gasto.id)
      );
      setGastos(updatedGastos);
      setSelectedForDeletion([]);
      setDeleteMode(false);
      setRestartPreserve(false);
      AsyncStorage.setItem("capitalGiro", adjustedCapitalGiro.toString());
      AsyncStorage.setItem("reservas", adjustedReservas.toString());
      AsyncStorage.setItem("gastos", JSON.stringify(updatedGastos));
    }
  };

  // ANIMAÇÃO DOS BOTÕES
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
  // <<IMPLEMENTAÇÃO DE FUNÇÕES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  // <CABEÇALHO - INÍCIO>
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <View style={styles.titlePosition}>
          <Image source={require("../images/Logo3.png")} style={styles.logo} />
          <Text style={styles.title}>CAIXA</Text>
        </View>

        {/* BOTÃO VOLTAR */}
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

      {/* <CAMPO DE DADOS DE CAIXA - INÍCIO> */}
      {/* CAPITAL DE GIRO */}
      <View style={styles.capitalContainer}>
        <View style={styles.capitalSection}>
          <Text style={styles.capitalLabel}>Giro</Text>
          <TextInput
            value={
              editCaixaMode
                ? capitalGiroInputValue
                : formatCurrency(capitalGiro)
            }
            editable={editCaixaMode}
            onChangeText={(text) => {
              const formatted = formatCurrencyInput(text);
              setCapitalGiroInputValue(formatted);
              const numericValue = parseFloat(
                formatted.replace(".", "").replace(",", ".")
              );
              setCapitalGiro(numericValue || 0);
            }}
            style={[
              styles.capitalValue,
              editCaixaMode ? styles.editableInput : styles.nonEditableInput,
              !editCaixaMode && capitalGiro < 0 && styles.negativeValue,
            ]}
            keyboardType="numeric"
          />
        </View>

        {/* TRANSFERIR ENTRE CAPITAL DE GIRO E RESERVA DE CAPITAL */}
        <View style={styles.transferSection}>
          <Text style={styles.transferLabel}>Transferir</Text>
          <TextInput
            value={transferInputValue}
            onChangeText={(text) => {
              const formatted = formatCurrencyInput(text);
              setTransferInputValue(formatted);
            }}
            placeholder="insira valor"
            keyboardType="numeric"
            style={styles.transferInput}
          />
          <View style={styles.transferButton1}>
            <TouchableOpacity
              onPress={() => transferirValor("toCapitalGiro")}
              style={[styles.transferButton2, styles.transferButtonLeft]}
            >
              <Text style={styles.transferButtonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => transferirValor("toReservas")}
              style={[styles.transferButton2, styles.transferButtonRight]}
            >
              <Text style={styles.transferButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RESERVA DE CAPITAL */}
        <View style={styles.capitalSection}>
          <Text style={styles.capitalLabel}>Reservas</Text>
          <TextInput
            value={
              editCaixaMode ? reservasInputValue : formatCurrency(reservas)
            }
            editable={editCaixaMode}
            onChangeText={(text) => {
              const formatted = formatCurrencyInput(text);
              setReservasInputValue(formatted);
              const numericValue = parseFloat(
                formatted.replace(".", "").replace(",", ".")
              );
              setReservas(numericValue || 0);
            }}
            style={[
              styles.capitalValue,
              editCaixaMode ? styles.editableInput : styles.nonEditableInput,
              !editCaixaMode && reservas < 0 && styles.negativeValue,
            ]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* FUNÇÃO DE EXCLUSÃO - APAGAR LISTA DE GASTOS, PRESERVANDO CAIXA ATUAL */}
      {deleteMode && (
        <View style={styles.restartPreserveContainer}>
          <View style={styles.restartPreserve}>
            <Switch
              value={restartPreserve}
              onValueChange={toggleRestartPreserve}
              style={styles.SwitchGasto}
            />
            <Text>Concluir Período</Text>
          </View>
        </View>
      )}

      {/* LINHA SEPARADORA ENTRE CAIXA E LISTA DE GASTOS */}
      <View style={styles.blackLine} />

      {/* LISTA DE GASTOS */}
      <ScrollView contentContainerStyle={styles.gastosContainer}>
        {gastos.map((gasto, index) => {
          const valorNumeric =
            parseFloat(
              (gasto.valor || "0").replace(".", "").replace(",", ".")
            ) || 0;
          return (
            <View
              key={gasto.id}
              style={[
                styles.gastoItem,
                {
                  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#e6e6e6",
                },
              ]}
            >
              {/* FUNÇÃO DE EXCLUSÃO - LISTA DE GASTOS - SWITCH */}
              {deleteMode && (
                <Switch
                  value={selectedForDeletion.includes(gasto.id)}
                  onValueChange={() => toggleSelectForDeletion(gasto.id)}
                  style={styles.SwitchGasto}
                />
              )}
              <TextInput
                value={gasto.descricao}
                editable={editMode && !gasto.isTransfer}
                onChangeText={(text) => updateGasto(index, "descricao", text)}
                placeholder="'Inserir débito/crédito'"
                style={[
                  styles.gastoDescricao,
                  gasto.isTransfer && styles.transferText,
                ]}
              />
              <TextInput
                value={
                  editMode && !gasto.isTransfer
                    ? gasto.valor
                    : formatCurrency(valorNumeric)
                }
                editable={editMode && !gasto.isTransfer}
                onChangeText={(text) => {
                  const formatted = formatCurrencyInput(text);
                  updateGasto(index, "valor", formatted);
                }}
                placeholder="0,00"
                keyboardType="numeric"
                style={[
                  styles.gastoValor,
                  !editMode && valorNumeric < 0 && styles.negativeValue,
                  gasto.isTransfer && styles.transferText,
                ]}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/* LAYOUT - BOTÃO EDITAR/SALVAR */}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
              (deleteMode || editCaixaMode) && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO EDITAR/SALVAR - INATIVO NO MODO EXCLUIR */}
            <Button
              title={editMode ? "Salvar" : "Editar"}
              color="#333399"
              onPress={() =>
                handleButtonPress(editButtonScale, () => setEditMode(!editMode))
              }
              disabled={deleteMode || editCaixaMode}
            />
          </Animated.View>

          {/* LAYOUT - BOTÃO NOVO - INATIVO NO MODO EXCLUIR */}
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: newButtonScale }] },
              (deleteMode || editCaixaMode) && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO NOVO */}
            <Button
              title="Novo"
              color="#333399"
              onPress={() => handleButtonPress(newButtonScale, addGasto)}
              disabled={deleteMode || editCaixaMode}
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
            {/* BOTÃO EXCLUIR */}
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

          {/* LAYOUT - BOTÃO SALVAR CAIXA/EDITAR CAIXA/CANCELAR */}
          {deleteMode ? (
            <View style={styles.downbuttonsMargin}>
              {/* BOTÃO CANCELAR */}
              <Button
                title="Cancelar"
                color="green"
                onPress={() => setDeleteMode(false)}
              />
            </View>
          ) : (
            !deleteMode && (
              <Animated.View
                style={[
                  styles.downbuttonsMargin,
                  { transform: [{ scale: editCaixaButtonScale }] },
                ]}
              >
                {/* BOTÃO SALVAR CAIXA/EDITAR CAIXA */}
                <Button
                  title={editCaixaMode ? "Salvar Caixa" : "Editar Caixa"}
                  color="orange"
                  onPress={() =>
                    handleButtonPress(
                      editCaixaButtonScale,
                      handleEditCaixaToggle
                    )
                  }
                />
              </Animated.View>
            )
          )}
        </View>
      </View>
    </View>
  );
}
// <RODAPÉ - FIM>
// <<INTERFACE GRÁFICA - FIM>>

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  // ESTILOS PADRÃO
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

  // ESTILOS ESPECÍFICOS
  capitalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 85,
    paddingHorizontal: 20,
  },
  capitalSection: {
    alignItems: "center",
  },
  capitalLabel: {
    fontSize: 19,
    fontWeight: "bold",
  },
  capitalValue: {
    fontSize: 18,
    marginTop: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    width: 113,
    marginHorizontal: -10,
  },
  editableInput: {
    borderColor: "#0000FF",
    color: "#000",
  },
  nonEditableInput: {
    backgroundColor: "#e6e6e6",
  },
  negativeValue: {
    color: "red",
  },
  transferText: {
    fontWeight: "bold",
  },
  transferSection: {
    alignItems: "center",
  },
  transferLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  transferInput: {
    width: 100,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 15,
    marginBottom: 15,
  },
  transferButton1: {
    flexDirection: "row",
    width: 120,
    justifyContent: "space-between",
  },
  transferButton2: {
    backgroundColor: "#333399",
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  transferButtonLeft: {
    marginRight: 1,
    marginLeft: 11,
  },
  transferButtonRight: {
    marginLeft: 1,
    marginRight: 11,
  },
  transferButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  blackLine: {
    height: 2,
    backgroundColor: "#000",
    marginVertical: 10,
    width: "100%",
  },
  gastosContainer: {
    paddingBottom: 160,
    paddingHorizontal: 5,
  },
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",    
  },
  SwitchGasto: {
    marginRight: 7,
    marginLeft: 8,
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  gastoDescricao: {
    flex: 1,
    fontSize: 16,
  },
  gastoValor: {
    width: 100,
    fontSize: 16,
    textAlign: "right",
    marginRight: 10,
  },
  restartPreserveContainer: {
    alignItems: "flex-start",
    paddingLeft: 5,
    paddingBottom: 0,
  },
  restartPreserve: {
    flexDirection: "row",
    alignItems: "center",
  },
});
// <<ESTILOS - FIM>>

// <<FIM DE 06_CAIXA.JS>>
