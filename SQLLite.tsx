import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { showLogs } from "./helpers";

type Book = {
  id: number;
  name: string;
};

export default function SQLLite() {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [bookIdToUpdate, setBookIdToUpdate] = useState<number | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  function openDatabase() {
    if (Platform.OS === "web") {
      return {
        transaction: () => {
          return {
            executeSql: () => {},
          };
        },
      };
    }

    const db = SQLite.openDatabase("localdb");
    return db;
  }

  const db = openDatabase();

  function readBooks() {
    db.transaction(
      (tx) => {
        const query = "SELECT * FROM books";
        const params: [] = [];
        tx.executeSql(query, params, (_, { rows }) => {
          setBooks(rows._array);
        });
      },
      (error) => console.error("Error getting books:", error)
    );
  }

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY NOT NULL, name TEXT)"
      );
    });

    readBooks();
  }, []);

  const addBook = (text: string) => {
    if (text === null || text === "") {
      Alert.alert("Please enter book name");
      return;
    }

    try {
      db.transaction(
        (tx) => {
          const query = "INSERT INTO books (name) VALUES (?)";
          const params = [text];
          tx.executeSql(query, params, () => {
            readBooks();
          });
        },
        (error) => {
          console.error("Error adding book:", error);
        }
      );
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  function deleteBook(bookId: number) {
    try {
      db.transaction((tx) => {
        const query = "DELETE FROM books WHERE id = ?";
        const params = [bookId];
        tx.executeSql(query, params);
      });

      readBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  }

  function updateBook(bookId: number) {
    if (text === null || text === "") {
      Alert.alert("Please enter book name");
      return;
    }

    try {
      db.transaction((tx) => {
        const query = "UPDATE books SET name = ? WHERE id = ?";
        const params = [text, bookId];
        tx.executeSql(query, params);
      });

      readBooks();
      setIsEditing(false);
      setBookIdToUpdate(null);
      setText("");
    } catch (error) {
      console.error("Error updating book:", error);
    }
  }

  return (
    <View>
      <TextInput
        onChangeText={(text) => setText(text)}
        placeholder="Enter the book name..."
        value={text}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: "#999",
          padding: 10,
          width: 200,
        }}
      />

      <Button
        title={isEditing ? "Update Book" : "Add Book"}
        onPress={
          isEditing ? () => updateBook(bookIdToUpdate!) : () => addBook(text)
        }
      />

      <View
        style={{ marginTop: 10, borderTopColor: "#444", borderTopWidth: 1 }}
      >
        {books.map((book) => (
          <View key={book.id}>
            <Text style={{ fontSize: 18, marginTop: 10 }}>{book.name}</Text>

            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => deleteBook(book.id)}>
                <Text style={{ color: "red" }}>Delete book</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setText(book.name);
                  setBookIdToUpdate(book.id);
                }}
              >
                <Text style={{ color: "blue" }}>Update book</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
