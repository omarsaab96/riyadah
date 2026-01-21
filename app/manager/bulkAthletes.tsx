import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RNFS from 'react-native-fs';

const { width } = Dimensions.get('window');

const BulkAthletesScreen = () => {
    const router = useRouter();
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [previewRows, setPreviewRows] = useState<any[]>([]);
    const [previewErrors, setPreviewErrors] = useState<any[]>([]);
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showHistoryCredentials, setShowHistoryCredentials] = useState<Record<string, boolean>>({});

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://server.riyadah.app/api/bulk-athletes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setHistory(data.data || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load history');
            }
        } catch (err) {
            console.error('Failed to load history', err);
            setError('Failed to load history');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDownloadTemplate = () => {
        Linking.openURL('https://server.riyadah.app/api/bulk-athletes/template');
    };

    const handlePickFile = async () => {
        try {
            setResult(null);
            setPreviewRows([]);
            setPreviewErrors([]);
            setFileBase64(null);
            setFilename(null);

            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-excel'
                ]
            });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            const asset = result.assets[0];
            const fileUri = asset.fileCopyUri || asset.uri;
            if (!fileUri) {
                Alert.alert('Error', 'Unable to read the selected file.');
                return;
            }

            const base64 = await RNFS.readFile(fileUri, 'base64');
            const token = await SecureStore.getItemAsync('userToken');

            setProcessing(true);
            const response = await fetch('https://server.riyadah.app/api/bulk-athletes/preview', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileBase64: base64,
                    filename: asset.name
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to preview file');
            }

            setPreviewRows(data.preview || []);
            setPreviewErrors(data.errors || []);
            setFileBase64(base64);
            setFilename(asset.name || null);
            setError(null);
        } catch (err: any) {
            console.error('Preview failed', err);
            setError(err.message || 'Preview failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleCommit = async () => {
        if (!fileBase64) return;

        try {
            setProcessing(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://server.riyadah.app/api/bulk-athletes/commit', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileBase64: fileBase64,
                    filename: filename
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Bulk creation failed');
            }

            setResult(data.data);
            setError(null);
            fetchHistory();
        } catch (err: any) {
            console.error('Bulk creation failed', err);
            setError(err.message || 'Bulk creation failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Bulk Athletes</Text>
                        <Text style={styles.pageDesc}>Upload Excel sheets to create accounts</Text>
                    </View>
                    <Text style={styles.ghostText}>Bulk</Text>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error && (
                            <View style={styles.error}>
                                <View style={styles.errorIcon}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Template</Text>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleDownloadTemplate}>
                                <Text style={styles.secondaryButtonText}>Download Excel Template</Text>
                            </TouchableOpacity>
                            <Text style={styles.helperText}>
                                Columns: Name, Email, Phone, Gender, Sport, Club Name, Club Email, Country.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>New Bulk Upload</Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={handlePickFile} disabled={processing}>
                                <Text style={styles.primaryButtonText}>
                                    {processing ? 'Processing...' : 'Upload Excel File'}
                                </Text>
                            </TouchableOpacity>

                            {!result && previewRows.length > 0 && (
                                <View style={styles.previewSection}>
                                    <Text style={styles.previewTitle}>Preview</Text>

                                    {previewErrors.length > 0 && (
                                        <View style={styles.previewErrors}>
                                            <Text style={styles.previewErrorTitle}>Errors</Text>
                                            {previewErrors.map((err, idx) => (
                                                <Text key={`${err.rowNumber}-${idx}`} style={styles.previewErrorText}>
                                                    # {err.rowNumber-1}: {err.message}
                                                </Text>
                                            ))}
                                        </View>
                                    )}

                                    {previewRows.map((row) => (
                                        <View key={row.rowNumber} style={styles.previewRow}>
                                            <Text style={styles.previewText}>#{row.rowNumber-1}</Text>
                                            <Text style={styles.previewText}>{row.name || 'Missing name'}</Text>
                                            <Text style={styles.previewSubText}>{row.email || 'Missing email'}</Text>
                                        </View>
                                    ))}

                                    

                                    <TouchableOpacity style={styles.primaryButton} onPress={handleCommit} disabled={processing}>
                                        <Text style={styles.primaryButtonText}>
                                            {processing ? 'Creating...' : 'Submit Bulk Creation'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {result && (
                                <View style={styles.resultSection}>
                                    <Text style={styles.sectionTitle}>Result</Text>
                                    <Text style={styles.resultText}>Total rows: {result.totalRows}</Text>
                                    <Text style={styles.resultText}>Created: {result.successCount}</Text>
                                    <Text style={styles.resultText}>Failed: {result.failureCount}</Text>
                                    {result.credentials?.length > 0 && (
                                        <View style={styles.credentials}>
                                            <Text style={styles.previewErrorTitle}>Created users</Text>
                                            {result.credentials.map((cred: any) => (
                                                <Text key={`${cred.rowNumber}-${cred.email}`} style={styles.previewText}>
                                                    # {cred.rowNumber-1}: {cred.email}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>History</Text>
                            {loadingHistory && <ActivityIndicator size="small" color="#FF4000" />}
                            {!loadingHistory && history.length === 0 && (
                                <Text style={styles.emptyText}>No bulk uploads yet.</Text>
                            )}
                            {!loadingHistory && history.map((item) => (
                                <View key={item._id} style={styles.historyItem}>
                                    <Text style={styles.historyTitle}>{item.filename || 'Bulk Upload'}</Text>
                                    <Text style={styles.historySub}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </Text>
                                    <Text style={styles.historySub}>
                                        Rows: {item.totalRows} | Success: {item.successCount} | Failed: {item.failureCount}
                                    </Text>
                                    {item.credentials?.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.historyToggle}
                                            onPress={() => setShowHistoryCredentials(prev => ({
                                                ...prev,
                                                [item._id]: !prev[item._id]
                                            }))}
                                        >
                                            <Text style={styles.historyToggleText}>
                                                {showHistoryCredentials[item._id] ? 'Hide credentials' : 'Show credentials'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {showHistoryCredentials[item._id] && item.credentials?.length > 0 && (
                                        <View style={styles.historyCredentials}>
                                            {item.credentials.map((cred: any) => (
                                                <Text key={`${item._id}-${cred.rowNumber}`} style={styles.previewText}>
                                                    Row {cred.rowNumber}: {cred.email} / {cred.password}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 220,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Acumin'
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 100,
        textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 10,
        right: -5,
        opacity: 0.2
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    error: {
        marginBottom: 15,
        backgroundColor: '#fce3e3',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    errorIcon: {
        width: 3,
        height: 15,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 10,
        marginTop: 3
    },
    errorText: {
        color: 'red',
        fontFamily: 'Acumin',
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111',
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignSelf: 'flex-start'
    },
    secondaryButtonText: {
        fontFamily: 'Qatar',
        fontSize: 14,
        color: '#150000'
    },
    helperText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666',
        marginTop: 8
    },
    primaryButton: {
        backgroundColor: '#FF4000',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10
    },
    primaryButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 16
    },
    previewSection: {
        marginTop: 15
    },
    previewTitle: {
        fontFamily: 'Qatar',
        fontSize: 16,
        marginBottom: 10
    },
    previewRow: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    previewText: {
        fontFamily: 'Acumin',
        color: '#111'
    },
    previewSubText: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 12
    },
    previewErrors: {
        marginTop: 10
    },
    previewErrorTitle: {
        fontFamily: 'Qatar',
        color: '#c0392b',
        marginBottom: 6
    },
    previewErrorText: {
        fontFamily: 'Acumin',
        color: '#c0392b',
        fontSize: 12
    },
    resultSection: {
        marginTop: 20
    },
    resultText: {
        fontFamily: 'Acumin',
        color: '#111',
        marginBottom: 4
    },
    credentials: {
        marginTop: 10
    },
    emptyText: {
        fontFamily: 'Acumin',
        color: '#666',
        fontStyle: 'italic'
    },
    historyItem: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    historyToggle: {
        marginTop: 8,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8
    },
    historyToggleText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#FF4000'
    },
    historyCredentials: {
        marginTop: 8
    },
    historyTitle: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111'
    },
    historySub: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666'
    }
});

export default BulkAthletesScreen;
