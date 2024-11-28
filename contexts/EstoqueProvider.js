// <<INÍCIO DE ESTOQUEPROVIDER.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
// VARIÁVEIS PRIMÁRIAS
export const EstoqueContext = createContext();
export const EstoqueProvider = ({ children }) => {
  const [estoque, setEstoque] = useState([]);

  // PROTOCOLO DE SAVE
  const saveDataToStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Erro ao salvar os dados no AsyncStorage:", error);
    }
  };

// PROTOCOLO DE LOAD
  const loadDataFromStorage = async (key, defaultValue) => {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Erro ao carregar os dados do AsyncStorage:", error);
      return defaultValue;
    }
  };

  // SOLICITAÇÃO DE LOADING DOS DADOS DO ESTOQUE
  useEffect(() => {
    const carregarEstoque = async () => {
      const estoqueSalvo = await loadDataFromStorage("estoque", []);
      setEstoque(estoqueSalvo);
    };
    carregarEstoque();
  }, []);

  // SALVA OS ITENS DO ESTOQUE EM TEMPO REAL
  useEffect(() => {
    saveDataToStorage("estoque", estoque);
  }, [estoque]);

  // ATUALIZAR ITEM DO ESTOQUE
  const atualizarItemEstoque = (itemAtualizado) => {
    setEstoque((prevEstoque) =>
      prevEstoque.map((item) =>
        item.id === itemAtualizado.id ? itemAtualizado : item
      )
    );
  };

  // ADICIONAR ITEM AO ESTOQUE
  const adicionarItem = (novoItem) => {
    const itemComId = {
      id: novoItem.id || Date.now(),
      ...novoItem,
    };
    setEstoque((prevEstoque) => [...prevEstoque, itemComId]);
  };

  // EXCLUIR ITENS DO ESTOQUE
  const excluirItensSelecionados = (idsParaExcluir) => {
    setEstoque((prevEstoque) =>
      prevEstoque.filter((item) => !idsParaExcluir.includes(item.id))
    );
  };
  // <<DEFINIÇAO DE COMPONENTES - FIM>>

  // <<CONFIGURAÇÃO DO PROVIDER - INÍCIO>>
  return (
        // COMANDOS PARA CONTROLAR A ADIÇÃO, ATUALIZAÇÃO E EXCLUSÃO DE ITENS DO ESTOQUE EM RELAÇÃO AOS PRODUTOS
    <EstoqueContext.Provider
      value={{
        estoque,
        adicionarItem,
        atualizarItemEstoque,
        excluirItensSelecionados,
      }}
    >
          {/* DISPONIBILIZAÇÃO DO CONTEXTO PARA JANELAS PERTINENTES */}
      {children}
    </EstoqueContext.Provider>
  );
};
// <<CONFIGURAÇÃO DO PROVIDER - FIM>>
// <<FIM DE ESTOQUEPROVIDER.JS>>
