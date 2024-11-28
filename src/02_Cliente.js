// <<INICIO DE 02_CLIENTE.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useContext, useState, useEffect } from 'react';
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
  TouchableHighlight,
  Modal,
  FlatList,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// INTERAGE COM 05_ESTOQUE.JS PARA INSERIR PEDIDOS
import { EstoqueContext } from '../contexts/EstoqueProvider';
import { ProdutosContext } from '../contexts/ProdutosProvider';
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<SAVE/LOAD - INÍCIO>>
async function saveDataToStorage(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar dados no AsyncStorage:', error);
  }
}

async function loadDataFromStorage(key, defaultValue) {
  try {
    const saved = await AsyncStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('Erro ao carregar dados do AsyncStorage:', error);
    return defaultValue;
  }
}
// <<SAVE/LOAD - FIM>>

// <<DEFINIÇÃO DE COMPONENTES - INÍCIO>>
export default function Cliente({ onNavigateBack }) {
  // <COMPONENTES FIXOS - INÍCIO>
  const defaultClientFields = [];
  // <COMPONENTES FIXOS - FIM>

  // VARIÁVEIS PRIMÁRIAS
  const [clientFields, setClientFields] = useState(defaultClientFields);
  const [orderFields, setOrderFields] = useState([]);
  const [currentClientIndex, setCurrentClientIndex] = useState(null);
  const [currentPedidoIndex, setCurrentPedidoIndex] = useState(null);
  const { estoque } = useContext(EstoqueContext);
  const { produtos } = useContext(ProdutosContext);

  // VARIÁVEIS AUXILIARES
  const [hiddenFields, setHiddenFields] = useState([]);
  const [modalScreen, setModalScreen] = useState(false);

  // BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [newButtonScale] = useState(new Animated.Value(1));
  const [deleteButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  // FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
  // INICIAR DADOS ARMAZENADOS NA MEMÓRIA
  useEffect(() => {
    const loadData = async () => {
      const loadedClientFields = await loadDataFromStorage(
        'clientFields',
        defaultClientFields
      );
      setClientFields(loadedClientFields);
    };
    loadData();
  }, []);

  // FUNÇÃO PARA CALCULAR O CUSTO TOTAL DE UM PRODUTO BASEADO NOS ITENS
  const calculateTotalPrice = (itens) => {
    return itens.reduce((total, item) => {
      const preco =
        typeof item.preco === 'number'
          ? item.preco
          : parseFloat(
              item.preco.replace(/[R$\s.]/g, '').replace(',', '.') || 0
            );
      const necessario = parseInt(item.necessario) || 0;
      return total + preco * necessario;
    }, 0);
  };

  // ADICIONAR NOVO CAMPO DE DADOS DO CLIENTE
  const addNewField = () => {
    setClientFields([
      ...clientFields,
      {
        nome: '',
        telefone: '',
        pedidos: [],
        comoMeEncontrou: '',
        detalhesObservacoes: '',
      },
    ]);
    setHiddenFields([...hiddenFields, false]);
    setEditMode(true);
  };

  // FORMATO DE NÚMERO DO TELEFONE
  const telefone = (telefone) => {
    telefone = telefone.replace(/\D/g, '');
    telefone = telefone.slice(0, 11); // Limita a 11 dígitos
    if (telefone.length <= 10) {
      // FORMATO DE NÚMERO: (00) 0000 0000
      telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2 $3');
    } else {
      // FORMATO DE NÚMERO: (00) 00000 0000
      telefone = telefone.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2 $3');
    }
    return telefone;
  };

  // ADIÇÃO DE PEDIDOS DIRETO DO ESTOQUEPROVIDER.JS
  const selectEstoqueItem = (selectedItem) => {
    if (currentClientIndex !== null) {
      const updatedFields = [...clientFields];
      const produtoCorrespondente = produtos.find(
        (produto) => produto.id === selectedItem.id
      );
      const custoProduto = produtoCorrespondente
        ? calculateTotalPrice(produtoCorrespondente.itens)
        : 0;
      if (currentPedidoIndex !== null) {
        updatedFields[currentClientIndex].pedidos[currentPedidoIndex] = {
          pedido: selectedItem.produto,
          inputQuantidade: '',
          preco: custoProduto,
          isFromEstoque: true,
        };
      } else {
        const existingPedidoIndex = updatedFields[
          currentClientIndex
        ].pedidos.findIndex((pedido) => pedido.pedido === selectedItem.produto);
        if (existingPedidoIndex !== -1) {
          Alert.alert(
            'Item já adicionado',
            'Este item já foi adicionado ao pedido.'          );
        } else {
          updatedFields[currentClientIndex].pedidos.push({
            pedido: selectedItem.produto,
            inputQuantidade: '',
            preco: custoProduto,
            isFromEstoque: true,
          });
        }
      }
      setClientFields(updatedFields);
      setModalScreen(false);
      setCurrentPedidoIndex(null);
      setCurrentClientIndex(null);
    }
  };

  // ADICIONAR NOVO PEDIDO PERSONALIZADO/FORA DO ESTOQUE
  const addPedido = (index) => {
    const updatedFields = [...clientFields];
    updatedFields[index].pedidos.push({
      pedido: '',
      inputQuantidade: '',
      preco: '',
      isFromEstoque: false,
    });
    setClientFields(updatedFields);
  };

  // HANDLE PREÇO CHANGE FOR PERSONALIZADO ORDERS
  const handlePrecoChange = (index, pedidoIndex, text) => {
    let valorFormatado = text.replace(/\D/g, '');
    const valorNumerico = parseFloat(valorFormatado) / 100;
    valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const updatedFields = [...clientFields];
    updatedFields[index].pedidos[pedidoIndex].preco = valorFormatado;
    setClientFields(updatedFields);
  };

  // SWITCH - EXCLUSÃO DE PEDIDOS
  const toggleSwitch = (fieldIndex, pedidoIndex) => {
    const updatedOrderFields = { ...orderFields };
    const key = `${fieldIndex}-${pedidoIndex}`;

    if (updatedOrderFields[key]) {
      delete updatedOrderFields[key];
    } else {
      updatedOrderFields[key] = true;
    }
    setOrderFields(updatedOrderFields);
  };

  // CONTROLE DE VISIBILIDADE DAS ABAS OCULTAS
  const toggleFieldsVisibility = (index) => {
    const updatedVisibility = [...hiddenFields];
    updatedVisibility[index] = !updatedVisibility[index];
    setHiddenFields(updatedVisibility);
  };

  // SAVE - CAMPOS DO CLIENTE
  const saveData = () => {
    saveDataToStorage('clientFields', clientFields);
  };

  // MÉTODOLOGIA DE MANUSEIO DOS ITENS SELECIONADOS
  const handleItemSelection = (clientIndex, pedidoIndex = null) => {
    if (editMode) {
      setCurrentClientIndex(clientIndex);
      setCurrentPedidoIndex(pedidoIndex);
      setModalScreen(true);
    }
  };

  // SELEÇÃO DE ITENS PARA EXCLUSÃO
  const toggleSelectForDeletion = (index) => {
    if (selectedForDeletion.includes(index)) {
      setSelectedForDeletion(
        selectedForDeletion.filter((selectedIndex) => selectedIndex !== index)
      );
    } else {
      setSelectedForDeletion([...selectedForDeletion, index]);
    }
  };

  // EXCLUSÃO DE ITENS
  const confirmDeletion = () => {
    const filteredFields = clientFields.filter(
      (_, index) => !selectedForDeletion.includes(index)
    );
    filteredFields.forEach((field, index) => {
      field.pedidos = field.pedidos.filter(
        (_, pedidoIndex) => !orderFields[`${index}-${pedidoIndex}`]
      );
    });
    setClientFields(filteredFields);
    setSelectedForDeletion([]);
    setOrderFields([]);
    setDeleteMode(false);
    saveDataToStorage('clientFields', filteredFields);
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

  // FUNÇÃO PARA CALCULAR O TOTAL DO CLIENTE
  const calculateClientTotal = (field) => {
    return field.pedidos.reduce((total, pedido) => {
      const quantity = parseInt(pedido.inputQuantidade) || 0;
      let price = 0;
      if (typeof pedido.preco === 'number') {
        price = pedido.preco;
      } else {
        price = parseFloat(
          pedido.preco.replace(/[R$\s.]/g, '').replace(',', '.') || 0
        );
      }
      return total + price * quantity;
    }, 0);
  };
  // <<IMPLEMENTAÇÃO DE FUNÇÕES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  // <CABEÇALHO - INÍCIO>
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <View style={styles.titlePosition}>
          <Image source={require('../images/Logo3.png')} style={styles.logo} />
          <Text style={styles.title}>CLIENTE</Text>
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

      {/* <MODAL - PEDIDOS DIRETO DO ESTOQUEPROVIDER.JS - INÍCIO> */}
      <Modal visible={modalScreen} transparent={true}>
        <View style={styles.modalWindow}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <FlatList
                data={estoque}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableHighlight
                    onPress={() => selectEstoqueItem(item)}
                    style={styles.modalItem}
                  >
                    <Text
                      style={styles.modalText}
                    >{`${item.produto} - Quant.: ${item.quantidade}`}</Text>
                  </TouchableHighlight>
                )}
              />
              <TouchableOpacity onPress={() => setModalScreen(false)}>
                <Text style={styles.modalCancelButton}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      {/* <MODAL - PEDIDOS DIRETO DO ESTOQUEPROVIDER.JS - FIM> */}

      {/* <CAMPO DE DADOS DO CLIENTE - INÍCIO> */}
      <ScrollView contentContainerStyle={styles.marginUpDown}>
        {clientFields.map((field, index) => (
          <View key={index} style={styles.spaceBetweenInvisibleTopics}>
            <View style={styles.spaceBetweenInvisibleTopics}>
              <View style={styles.spaceFromInvisibleTopics}>
                {/* FUNÇÃO DE EXCLUSÃO - CAMPO DE DADOS DO CLIENTE - SWITCH */}
                {deleteMode && (
                  <Switch
                    value={selectedForDeletion.includes(index)}
                    onValueChange={() => toggleSelectForDeletion(index)}
                    style={styles.SwitchNome}
                  />
                )}

                {/* NOME */}
                <Text style={{ marginRight: 10, fontWeight: 'bold' }}>
                  Nome:
                </Text>
                <TextInput
                  value={field.nome}
                  editable={editMode}
                  onFocus={() => toggleFieldsVisibility(index)}
                  onChangeText={(text) => {
                    const updatedFields = [...clientFields];
                    updatedFields[index].nome = text;
                    setClientFields(updatedFields);
                  }}
                  style={styles.nameBox}
                />

                {/* SETAS PARA ABA OCULTA */}
                <TouchableOpacity onPress={() => toggleFieldsVisibility(index)}>
                  <Text style={styles.arrow}>
                    {hiddenFields[index] ? '▼' : '►'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <ABA OCULTA - INÍCIO> */}
              {hiddenFields[index] && (
                // TELEFONE
                <View>
                  <View style={styles.spaceBetweenInvisibleTopics}>
                    <Text style={{ fontWeight: 'bold' }}>Telefone:</Text>
                    <TextInput
                      value={field.telefone}
                      editable={editMode}
                      onChangeText={(text) => {
                        const formattedText = telefone(text);
                        const updatedFields = [...clientFields];
                        updatedFields[index].telefone = formattedText;
                        setClientFields(updatedFields);
                      }}
                      placeholder=""
                      style={styles.inputTelHow}
                    />
                  </View>

                  {/* COMO ME ENCONTROU */}
                  <View style={styles.spaceBetweenInvisibleTopics}>
                    <Text style={{ fontWeight: 'bold' }}>
                      Como me encontrou:
                    </Text>
                    <TextInput
                      value={field.comoMeEncontrou}
                      editable={editMode}
                      onChangeText={(text) => {
                        const updatedFields = [...clientFields];
                        updatedFields[index].comoMeEncontrou = text;
                        setClientFields(updatedFields);
                      }}
                      style={styles.inputTelHow}
                    />
                  </View>
                  {/* <CAMPO DE DADOS DO CLIENTE - FIM> */}

                  {/* <CAMPO DE PEDIDOS - INÍCIO> */}
                  {field.pedidos.map((pedido, pedidoIndex) => (
                    <View key={pedidoIndex} style={styles.spaceBetweenPedidos}>
                      {/* FUNÇÃO DE EXCLUSÃO - CAMPO DE PEDIDOS - SWITCH */}
                      <View style={styles.switchContainer}>
                      {deleteMode && (
                        <Switch
                          value={
                            orderFields[`${index}-${pedidoIndex}`] || false
                          }
                          onValueChange={() =>
                            toggleSwitch(index, pedidoIndex)
                          }
                          style={styles.SwitchPedido}
                        />
                      )}
 ) : null}
</View>
                      {/* PEDIDO */}
                      <View>
                        <Text style={{fontWeight: 'bold'}}>
                          Pedido:
                        </Text>
                        {pedido.isFromEstoque ? (
                          <TouchableHighlight
                            onPress={() =>
                              handleItemSelection(index, pedidoIndex)
                            }
                            underlayColor={editMode ? '#DDD' : null}
                          >
                            <View>
                              <TextInput
                                value={pedido.pedido}
                                editable={false}
                                style={[styles.inputPedidos, styles.boldText]}
                              />
                            </View>
                          </TouchableHighlight>
                        ) : (
                          <TextInput
                            value={pedido.pedido}
                            editable={editMode}
                            onChangeText={(text) => {
                              const updatedFields = [...clientFields];
                              updatedFields[index].pedidos[pedidoIndex].pedido =
                                text;
                              setClientFields(updatedFields);
                            }}
                            style={styles.inputPedidos}
                          />
                        )}
                      </View>

                      {/* QUANTIDADE */}
                      <View>
                        <Text style={{ fontWeight: 'bold' }}>
                          Quant.:
                        </Text>
                        <TextInput
                          value={pedido.inputQuantidade}
                          editable={editMode}
                          onChangeText={(text) => {
                            const numericText = text.replace(/\D/g, '');
                            const updatedFields = [...clientFields];
                            updatedFields[index].pedidos[
                              pedidoIndex
                            ].inputQuantidade = numericText;
                            setClientFields(updatedFields);
                          }}
                          placeholder=""
                          style={[
                            styles.inputQuantidade,
                            pedido.isFromEstoque ? styles.boldText : null,
                          ]}
                        />
                      </View>

                      {/* PREÇO */}
                      <View>
                        <Text style={{ fontWeight: 'bold' }}>
                          Preço:
                        </Text>
                        {pedido.isFromEstoque ? (
                          <TextInput
                            value={pedido.preco.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                            editable={false}
                            style={[styles.inputPreco, styles.boldText]}
                          />
                        ) : (
                          <TextInput
                            value={pedido.preco}
                            editable={editMode}
                            onChangeText={(text) =>
                              handlePrecoChange(index, pedidoIndex, text)
                            }
                            style={styles.inputPreco}
                            keyboardType="numeric"
                          />
                        )}
                      </View>
                    </View>
                  ))}

                  {/* TOTAL */}
                  <View style={styles.totalContainer}>
                    <View>
                      <Text style={{ fontWeight: 'bold' }}>
                        Total:
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.totalAmount}>
                        {calculateClientTotal(field).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* <BOTÕES - ADICIONAR PEDIDO E QUANTIDADE - INÍCIO> */}
                  {editMode && (
                    <View
                      style={[styles.buttonContainer, { marginTop: 10 }]}
                    >
                      {/* BOTÃO - ADICIONAR PEDIDO DE ESTOQUEPROVIDER.JS */}
                      <TouchableOpacity
                        onPress={() => handleItemSelection(index)}
                      >
                        <Text style={styles.addButton}>+</Text>
                      </TouchableOpacity>

                      {/* BOTÃO - ADICIONAR PEDIDO EDITÁVEL/PERSONALIZADO */}
                      <TouchableOpacity onPress={() => addPedido(index)}>
                        <Text style={styles.customButton}>Personalizado</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* <BOTÕES - ADICIONAR PEDIDO E QUANTIDADE - FIM> */}
                  {/* <CAMPO DE PEDIDOS - FIM> */}

                  {/* DETALHES/OBSERVAÇÕES */}
                  <View
                    style={[
                      styles.spaceBetweenInvisibleTopics,
                      { marginTop: 10 },
                    ]}
                  >
                    <Text style={{ fontWeight: 'bold' }}>
                      Detalhes/Observações:
                    </Text>
                    <TextInput
                      value={field.detalhesObservacoes}
                      editable={editMode}
                      onChangeText={(text) => {
                        const updatedFields = [...clientFields];
                        updatedFields[index].detalhesObservacoes = text;
                        setClientFields(updatedFields);
                      }}
                      multiline
                      numberOfLines={10}
                      style={styles.detalhesObservacoesBox}
                    />
                  </View>
                </View>
              )}

              {/* LINHA SEPARADORA */}
              <View
                style={[
                  styles.blackLine,
                  { marginTop: 10, marginBottom: 10, width: 500 },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/* LAYOUT - BOTÃO EDITAR/SALVAR */}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO EDITAR/SALVAR - INATIVO NO MODO EXCLUIR */}
            <Button
              title={editMode ? 'Salvar' : 'Editar'}
              color='#333399'
              onPress={() =>
                handleButtonPress(editButtonScale, () => {
                  if (editMode) saveData();
                  setEditMode(!editMode);
                })
              }
              disabled={deleteMode}
            />
          </Animated.View>

          {/* LAYOUT - BOTÃO NOVO - INATIVO NO MODO EXCLUIR */}
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: newButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO NOVO */}
            <Button
              title='Novo'
              color='#333399'
              onPress={() => handleButtonPress(newButtonScale, addNewField)}
              disabled={deleteMode}
            />
          </Animated.View>

          {/* LAYOUT - BOTÕES EXCLUIR */}
        </View>
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: deleteButtonScale }] },
            ]}
          >
            {/* BOTÕES EXCLUIR */}
            {deleteMode ? (
              <Button
                title='Excluir'
                color='red'
                onPress={() =>
                  handleButtonPress(deleteButtonScale, confirmDeletion)
                }
              />
            ) : (
              <Button
                title='Excluir'
                color='red'
                onPress={() =>
                  handleButtonPress(deleteButtonScale, () =>
                    setDeleteMode(true)
                  )
                }
              />
            )}
          </Animated.View>

          {/* LAYOUT - BOTÃO CANCELAR - SÓ APARECE NO MODO EXCLUSÃO */}
          {deleteMode && (
            <Animated.View
              style={[
                styles.downbuttonsMargin,
                { transform: [{ scale: deleteButtonScale }] },
              ]}
            >
              {/* BOTÃO CANCELAR */}
              <Button
                title='Cancelar'
                color='green'
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
  // <RODAPE - FIM>
  // <<INTERFACE GRÁFICA - FIM>>
}

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  // ESTILOS PADRÃO
  background: {
    flex: 1.0,
    backgroundColor: '#ffccff',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    justifyContent: 'center',
    backgroundColor: '#cc99ff',
    paddingHorizontal: 50,
  },
  downbuttonsDistance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  SwitchNome: {    
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  nameBox: {
    borderWidth: 1,
    borderColor: '#330066',
    padding: 1,
    borderRadius: 5,
    fontSize: 15,
    marginTop: 5,
    width: 200,
    textAlign: 'left',
  },
  spaceFromInvisibleTopics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  arrow: {
    fontSize: 28,
    marginLeft: 15,
    color: '#333',
  },
  inputTelHow: {
    borderWidth: 1,
    borderColor: '#330066',
    marginRight: 15,
    padding: 1,
    borderRadius: 5,
    fontSize: 15,
    marginTop: 0,
    width: 200,
    textAlign: 'center',
    color: '#000',
  },
  spaceBetweenInvisibleTopics: {
    marginBottom: 2,
    alignItems: 'center',
  },
  SwitchPedido: {
    marginTop: 15,
    marginLeft: -25,
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],    
  },
  switchContainer: {
  width: 5,
  justifyContent: 'center',
  alignItems: 'center',
},
  inputPedidos: {
    width: 150,
    height: 30,
    padding: 1,
    borderWidth: 1,
    borderColor: "#330066",
    borderRadius: 5,
    marginLeft: 0,
    marginRight: 0,    
    textAlign: "left",
  },
  inputQuantidade: {
    width: 50,
    height: 30,
    padding: 1,
    borderWidth: 1,
    borderColor: "#330066",
    borderRadius: 5,
    marginLeft: 4,
    marginRight: 4,
    textAlign: "center",
  },
  inputPreco: {
    width: 80,
    height: 30,
    padding: 1,
    borderWidth: 1,
    borderColor: "#330066",
    borderRadius: 5,
    marginLeft: 0,
    marginRight: -100,
    textAlign: "center",
  },
  boldText: {
    fontWeight: 'bold',
  },
  spaceBetweenPedidos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    justifyContent: 'space-between',
    marginHorizontal: 50,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',    
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  addButton: {
  backgroundColor: '#007bff',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  overflow: 'hidden',
  marginRight: 75,
},

customButton: {
  backgroundColor: '#333399',
  paddingVertical: 20,
  paddingHorizontal: 10,
  borderRadius: 8,
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  overflow: 'hidden',
  flex: 2,
},
  modalWindow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxHeight: '100%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalCancelButton: {
    marginTop: 0,
    color: 'blue',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(50,0,255,0.2)',
  },
  detalhesObservacoesBox: {
    width: 300,
    height: 80,
    borderWidth: 1,
    borderColor: '#330066',
    padding: 1,
    borderRadius: 5,
    fontSize: 15,
    marginTop: 1,
    textAlign: 'center',
  },
  blackLine: {
    height: 2,
    backgroundColor: '#000000',
    marginVertical: 5,
    width: '100%',
    alignSelf: 'center',
  },
});
// <<ESTILOS - FIM>>

// <<FIM DE 02_CLIENTE.JS>>
