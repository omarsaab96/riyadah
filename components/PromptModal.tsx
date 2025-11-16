// components/PromptModal.js
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PromptModal({ visible, onClose, onSubmit, title }) {
    const [value, setValue] = useState("");

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>hi</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter age group..."
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={setValue}
                    />

                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.ok]}
                            onPress={() => {
                                onSubmit(value);
                                setValue("");
                                onClose();
                            }}
                        >
                            <Text style={styles.btnTextWhite}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center"
    },
    box: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20
    },
    row: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10
    },
    cancel: {
        backgroundColor: "#eee"
    },
    ok: {
        backgroundColor: "#007bff"
    },
    btnText: {
        color: "#333",
        fontWeight: "500"
    },
    btnTextWhite: {
        color: "#fff",
        fontWeight: "600"
    }
});
