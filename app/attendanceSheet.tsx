import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const AttendanceSheet = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [presentAthletes, setPresentAthletes] = useState({});
    const [timer, setTimer] = useState(2);
    const [isExistingAttendance, setIsExistingAttendance] = useState(false);

    const { event } = useLocalSearchParams();

    useEffect(() => {
        if (!event) return;

        const fetchTeamMembers = async () => {
            try {
                const response = await fetch(`http://193.187.132.170:5000/api/attendance/byEvent/${event._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setTeamName(data.data.name);
                    setAthletes(data.data.members);
                    setIsExistingAttendance(data.data.isExisting);

                    let initialAttendance = {};

                    // If it's existing attendance, mark only present athletes
                    if (data.data.isExisting && data.data.present) {
                        data.data.members.forEach(athlete => {
                            initialAttendance[athlete._id] = data.data.present.some(
                                presentAthlete => presentAthlete._id === athlete._id
                            );
                        });
                    } else {
                        // If new attendance, default all to present
                        data.data.members.forEach(athlete => {
                            initialAttendance[athlete._id] = true;
                        });
                    }

                    setPresentAthletes(initialAttendance);
                } else {
                    setAthletes([]);
                    Alert.alert('Error', data.message || 'Failed to fetch attendance data');
                }

            } catch (err) {
                console.error('Error fetching athletes:', err);
                Alert.alert('Error', 'Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [event]);

    useEffect(() => {
        if (submitted && timer > 0) {
            const countdown = setTimeout(() => {
                setTimer(timer - 1);
            }, 1000);

            return () => clearTimeout(countdown);
        } else if (submitted && timer === 0) {
            router.back();
        }
    }, [submitted, timer]);

    const handleSubmit = async () => {
        const attendedAthletes = Object.keys(presentAthletes).filter(id => presentAthletes[id]);

        const body = {
            present: attendedAthletes,
            teamId: event.team,
            eventId: event._id
        };

        try {
            setSaving(true);

            const response = await fetch('http://193.187.132.170:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit attendance');
            }
        } catch (err) {
            console.error('Error submitting attendance:', err);
            Alert.alert('Error', 'Failed to submit attendance. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    // ... rest of your component JSX remains the same ...
};

export default AttendanceSheet;