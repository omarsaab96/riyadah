import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegistration } from '../../context/registration';

const { width } = Dimensions.get('window');
const accountTypes = [
    { label: 'Football', icon: require('../../assets/football.png') },
    { label: 'Basketball', icon: require('../../assets/basketball.png') },
    { label: 'Gymnastics', icon: require('../../assets/gymnastics.png') },
    { label: 'Racing', icon: require('../../assets/racing.png') },
    { label: 'Golf', icon: require('../../assets/golf.png') },
];

export default function WizardStep3() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const { formData, updateFormData } = useRegistration();
    const [selected, setSelected] = useState<string | null>(formData.sport || null);

    const handleNext = () => {
        if(selected){
            updateFormData({ sport: selected });
            console.log(formData)
            router.push('/wizard/step4')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>
                        Sport type
                    </Text>
                    <Text style={styles.pageDesc}>
                        What do you do?
                    </Text>
                </View>

                <Text style={styles.ghostText}>
                    Sport
                </Text>

            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#A8A8A8"
                    value={keyword}
                    onChangeText={setKeyword}
                />
            </View>

            <ScrollView >

                <View style={styles.wizardContainer}>
                    {accountTypes.map(({ label, icon }, idx) => (
                        <TouchableOpacity
                            key={label}
                            style={[
                                styles.accountOption,
                                selected === label && styles.accountOptionSelected,
                            ]}
                            onPress={() => setSelected(label)}
                        >
                            <Image source={icon} style={styles.icon} resizeMode="contain" />
                            <Text style={[styles.accountText, selected === label && styles.accountTextSelected]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}

                </View>
            </ScrollView>

            <View style={styles.fixedBottomSection}>
                <TouchableOpacity style={styles.fullButtonRow} onPress={handleNext}>
                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                    <View style={styles.loginButton}>
                        <Text style={styles.loginText}>next</Text>
                    </View>
                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        marginBottom: 30
    },
    logo: {
        width: 150,
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Bebas',
        fontSize: 30,
        marginBottom: 10
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope'
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    loginButton: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Bebas',
    },
    sideRect: {
        height: 48,
        width: 13,
    },
    sideRectAfter: {
        height: 48,
        width: 13,
        marginLeft: -1
    },
    wizardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 80
    },
    accountOption: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        width: (width - 60) / 2,
        position: 'relative',
        height: 120,
        fontFamily: 'Manrope'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Manrope'
    },
    accountText: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Manrope',
    },
    icon: {
        width: 80,
        height: 80,
        position: 'absolute',
        bottom: 0,
        right: 0
    },
    accountTextSelected: {
        color: '#FF4000',
        fontWeight: 'bold',
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    form: {
        paddingLeft: 20,
        paddingRight: 20
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
});