import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    Animated,
} from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import {
    PinchGestureHandler,
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';
import {
    Bike,
    CarFront,
    History,
    MapPinned,
    Package,
    UserRound,
    UserCircle2,
} from 'lucide-react-native';

const initialRegion: Region = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

const mapNodes = [
    {
        id: 'pickup',
        title: 'Pickup',
        description: 'Restaurant node',
        latitude: 19.4362,
        longitude: -99.1471,
        tint: '#111827',
    },
    {
        id: 'courier',
        title: 'Courier',
        description: 'Driver is moving',
        latitude: 19.4329,
        longitude: -99.1392,
        tint: '#00a2ff',
    },
    {
        id: 'dropoff',
        title: 'You',
        description: 'Your position',
        latitude: 19.4289,
        longitude: -99.1302,
        tint: '#16a34a', // Upgraded to a Green Point
    },
];

const fallbackBuildings = [
    { top: 58, left: 32, width: 70, height: 130, tone: '#ffffff' },
    { top: 46, left: 122, width: 58, height: 92, tone: '#dbeafe' },
    { top: 76, left: 214, width: 92, height: 150, tone: '#ffffff' },
    { top: 42, left: 324, width: 64, height: 108, tone: '#bfdbfe' },
    { top: 248, left: 38, width: 110, height: 116, tone: '#ffffff' },
    { top: 226, left: 158, width: 78, height: 148, tone: '#dbeafe' },
    { top: 262, left: 278, width: 102, height: 96, tone: '#ffffff' },
];

const fallbackRoads = [
    { top: 132, left: 0, width: 420, height: 10 },
    { top: 262, left: 0, width: 420, height: 10 },
    { top: 0, left: 120, width: 10, height: 420 },
    { top: 0, left: 248, width: 10, height: 420 },
];

const fallbackPlaces = [
    { name: 'Mall', top: 98, left: 82, icon: Package, tint: '#111827' },
    { name: 'Courier', top: 186, left: 202, icon: Bike, tint: '#00a2ff' },
    { name: 'Home', top: 304, left: 308, icon: UserRound, tint: '#16a34a' }, // Upgraded to Green
    { name: 'Park', top: 286, left: 88, icon: MapPinned, tint: '#0f172a' },
];

const navItems = [
    { key: 'map', label: 'Map', icon: MapPinned },
    { key: 'history', label: 'History', icon: History },
    { key: 'profile', label: 'Profile', icon: UserCircle2 },
    { key: 'order', label: 'Order', icon: Package },
] as const;

type TabKey = (typeof navItems)[number]['key'];

function NodeMarker({
    title,
    description,
    latitude,
    longitude,
    tint,
    Icon,
}: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    tint: string;
    Icon: any;
}) {
    return (
        <Marker coordinate={{ latitude, longitude }} title={title} description={description}>
            <View style={[styles.markerBubble, { borderColor: tint }]}>
                <View style={[styles.markerInner, { backgroundColor: tint }]}>
                    <Icon size={16} color="#ffffff" strokeWidth={2.4} />
                </View>
            </View>
        </Marker>
    );
}

function MapFallback({ progress }: { progress: Animated.Value }) {
    const pinchScale = useRef(new Animated.Value(1)).current;
    const baseScale = useRef(new Animated.Value(1)).current;
    const scale = Animated.multiply(baseScale, pinchScale);
    const panX = useRef(new Animated.Value(0)).current;
    const panY = useRef(new Animated.Value(0)).current;
    const panXBase = useRef(new Animated.Value(0)).current;
    const panYBase = useRef(new Animated.Value(0)).current;
    const lastScale = useRef(1);

    const onPinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: pinchScale } }],
        { useNativeDriver: true }
    );

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const nextScale = Math.max(0.8, Math.min(lastScale.current * event.nativeEvent.scale, 2.4));
            lastScale.current = nextScale;
            baseScale.setValue(nextScale);
            pinchScale.setValue(1);
        }
    };

    const onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: panX, translationY: panY } }],
        { useNativeDriver: true }
    );

    const onPanHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            panXBase.setValue((panXBase as any)._value + event.nativeEvent.translationX);
            panYBase.setValue((panYBase as any)._value + event.nativeEvent.translationY);
            panX.setOffset((panXBase as any)._value);
            panY.setOffset((panYBase as any)._value);
            panX.setValue(0);
            panY.setValue(0);
        }
    };

    // Animate Courier Position on Android Fallback Map
    const courierTop = progress.interpolate({ inputRange: [0, 1], outputRange: [186, 304] });
    const courierLeft = progress.interpolate({ inputRange: [0, 1], outputRange: [202, 308] });

    return (
        <View style={styles.mapFallback}>
            <View style={styles.mapGrid} />

            <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
                <Animated.View style={styles.gestureLayer}>
                    <PanGestureHandler onGestureEvent={onPanGestureEvent} onHandlerStateChange={onPanHandlerStateChange}>
                        <Animated.View
                            style={[
                                styles.mapCanvas,
                                {
                                    transform: [
                                        { translateX: panX },
                                        { translateY: panY },
                                        { scale },
                                    ],
                                },
                            ]}
                        >
                            {fallbackRoads.map((road, index) => (
                                <View key={`road-${index}`} style={[styles.road, road]} />
                            ))}

                            {fallbackBuildings.map((building, index) => (
                                <View
                                    key={`building-${index}`}
                                    style={[
                                        styles.building,
                                        {
                                            top: building.top,
                                            left: building.left,
                                            width: building.width,
                                            height: building.height,
                                            backgroundColor: building.tone,
                                        },
                                    ]}
                                >
                                    <View style={styles.buildingWindows} />
                                </View>
                            ))}

                            <View style={styles.mapRouteLine} />

                            {fallbackPlaces.map((place) => {
                                const Icon = place.icon;

                                // Render Animated Courier 
                                if (place.name === 'Courier') {
                                    return (
                                        <Animated.View key={place.name} style={[styles.mapPlace, { top: courierTop, left: courierLeft, zIndex: 10 }]}>
                                            <View style={[styles.mapNode, { backgroundColor: place.tint, borderColor: '#ffffff' }]}>
                                                <Icon size={15} color="#ffffff" strokeWidth={2.4} />
                                            </View>
                                            <Text style={styles.placeLabel}>{place.name}</Text>
                                        </Animated.View>
                                    );
                                }

                                return (
                                    <View key={place.name} style={[styles.mapPlace, { top: place.top, left: place.left }]}>
                                        <View style={[styles.mapNode, { backgroundColor: place.tint, borderColor: '#ffffff' }]}>
                                            <Icon size={15} color="#ffffff" strokeWidth={2.4} />
                                        </View>
                                        <Text style={styles.placeLabel}>{place.name}</Text>
                                    </View>
                                );
                            })}
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </PinchGestureHandler>

            <View style={styles.mapLegend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#111827' }]} />
                    <Text style={styles.legendText}>Places</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#00a2ff' }]} />
                    <Text style={styles.legendText}>Courier</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
                    <Text style={styles.legendText}>You</Text>
                </View>
            </View>
        </View>
    );
}

export default function HomeScreen() {
    const [selectedTab, setSelectedTab] = useState<TabKey>('map');
    const courierMode = 'motorbike';

    // State & Animation Values
    const progress = useRef(new Animated.Value(0)).current;
    const [courierLoc, setCourierLoc] = useState({ latitude: mapNodes[1].latitude, longitude: mapNodes[1].longitude });
    const [eta, setEta] = useState(8);

    useEffect(() => {
        const start = { latitude: mapNodes[1].latitude, longitude: mapNodes[1].longitude };
        const end = { latitude: mapNodes[2].latitude, longitude: mapNodes[2].longitude };

        // Attach listener to update GPS marker position & ETA text
        const listener = progress.addListener(({ value }) => {
            setCourierLoc({
                latitude: start.latitude + (end.latitude - start.latitude) * value,
                longitude: start.longitude + (end.longitude - start.longitude) * value,
            });
            setEta(Math.ceil(8 * (1 - value))); // Countdown from 8 to 0
        });

        // Loop animation indefinitely to visualize the live tracking preview
        Animated.loop(
            Animated.sequence([
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 12000,
                    useNativeDriver: false, // Prevents crash when state-binding layout values
                }),
                Animated.timing(progress, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                })
            ])
        ).start();

        return () => { progress.removeListener(listener); };
    }, []);

    // Create polyline dynamically stretching from Pickup -> Live Courier -> Destination
    const routePoints = [
        { latitude: mapNodes[0].latitude, longitude: mapNodes[0].longitude },
        courierLoc,
        { latitude: mapNodes[2].latitude, longitude: mapNodes[2].longitude },
    ];

    const renderContent = () => {
        if (selectedTab === 'map') {
            const CourierIcon = courierMode === 'motorbike' ? Bike : CarFront;

            return (
                <View style={styles.mapShell}>
                    {Platform.OS === 'android' ? (
                        <MapFallback progress={progress} />
                    ) : (
                        <MapView style={styles.map} initialRegion={initialRegion}>
                            <Polyline
                                coordinates={routePoints}
                                strokeColor="#00a2ff"
                                strokeWidth={4}
                                lineCap="round"
                            />

                            <NodeMarker
                                title="Pickup"
                                description="Restaurant node"
                                latitude={mapNodes[0].latitude}
                                longitude={mapNodes[0].longitude}
                                tint="#111827"
                                Icon={Package}
                            />

                            {/* Animated Courier Marker */}
                            <NodeMarker
                                title="Courier"
                                description="Your driver is on the way"
                                latitude={courierLoc.latitude}
                                longitude={courierLoc.longitude}
                                tint="#00a2ff"
                                Icon={CourierIcon}
                            />

                            {/* Destination Marker - Now Green */}
                            <NodeMarker
                                title="You"
                                description="Your position"
                                latitude={mapNodes[2].latitude}
                                longitude={mapNodes[2].longitude}
                                tint="#16a34a"
                                Icon={UserRound}
                            />
                        </MapView>
                    )}

                    <View style={styles.trackerCard}>
                        <View style={styles.trackerHeader}>
                            <View style={styles.trackerIconWrap}>
                                <CourierIcon size={20} color="#00a2ff" strokeWidth={2.2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.trackerTitle}>Courier on the way</Text>
                                <Text style={styles.trackerSubtitle}>Heading to your position</Text>
                            </View>
                            <View style={styles.etaBadge}>
                                <Text style={styles.etaText}>{eta} min</Text>
                            </View>
                        </View>

                        <View style={styles.trackerRoute}>
                            <View style={styles.routePoint}>
                                <View style={styles.routeDot} />
                                <Text style={styles.routeLabel}>Courier</Text>
                            </View>

                            {/* Animated Live Tracker Progress Bar */}
                            <View style={styles.routeLineContainer}>
                                <Animated.View
                                    style={[
                                        styles.routeProgressLine,
                                        { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        styles.movingTrackerIcon,
                                        { left: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                                    ]}
                                >
                                    <CourierIcon size={14} color="#00a2ff" strokeWidth={2.5} />
                                </Animated.View>
                            </View>

                            <View style={styles.routePoint}>
                                <View style={[styles.routeDot, styles.routeDotDestination]} />
                                <Text style={styles.routeLabel}>You</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{navItems.find(t => t.key === selectedTab)?.label}</Text>
                    <Text style={styles.sectionSubtitle}>View detailed information</Text>
                </View>
                <Text style={styles.placeholderText}>This section can be expanded later.</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.brand}>TheEater</Text>
                    <Text style={styles.subtitle}>Track the delivery and switch views instantly</Text>
                </View>

                <View style={styles.navBar}>
                    {navItems.map(({ key, label, icon: Icon }) => {
                        const active = selectedTab === key;
                        return (
                            <Pressable
                                key={key}
                                onPress={() => setSelectedTab(key)}
                                style={({ pressed }) => [
                                    styles.navButton,
                                    active && styles.navButtonActive,
                                    pressed && styles.navButtonPressed,
                                ]}
                            >
                                <Icon size={16} color={active ? '#ffffff' : '#0f172a'} strokeWidth={2.3} />
                                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 56,
        paddingBottom: 28,
        gap: 18,
    },
    header: { gap: 6 },
    brand: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 15,
        color: '#475569',
    },
    navBar: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    navButtonActive: {
        backgroundColor: '#00a2ff',
        borderColor: '#00a2ff',
        shadowColor: '#00a2ff',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 14,
        elevation: 3,
    },
    navButtonPressed: { transform: [{ scale: 0.98 }] },
    navLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    navLabelActive: { color: '#ffffff' },
    mapShell: { gap: 14 },
    map: {
        width: '100%',
        height: 420,
        borderRadius: 24,
    },
    mapFallback: {
        width: '100%',
        height: 420,
        borderRadius: 24,
        backgroundColor: '#dbeafe',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    gestureLayer: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
    },
    mapGrid: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: 'rgba(255,255,255,0.14)',
        opacity: 1,
        borderRadius: 24,
    },
    mapCanvas: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
    },
    road: {
        position: 'absolute',
        backgroundColor: 'rgba(15, 23, 42, 0.14)',
        borderRadius: 999,
    },
    building: {
        position: 'absolute',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 14,
        elevation: 2,
    },
    buildingWindows: {
        height: 18,
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
    },
    mapRouteLine: {
        position: 'absolute',
        top: 120, left: 90, width: 240, height: 6,
        borderRadius: 999,
        backgroundColor: '#00a2ff',
        opacity: 0.55,
        transform: [{ rotate: '-11deg' }],
    },
    mapPlace: {
        position: 'absolute',
        alignItems: 'center',
        gap: 6,
    },
    placeLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0f172a',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
    },
    mapLegend: {
        position: 'absolute',
        left: 14, right: 14, bottom: 14,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.88)',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10, height: 10,
        borderRadius: 999,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
    },
    mapNode: {
        width: 42, height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowColor: '#0f172a',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 16,
        elevation: 3,
    },
    trackerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#0f172a',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 2,
        gap: 16,
    },
    trackerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    trackerIconWrap: {
        width: 42, height: 42,
        borderRadius: 14,
        backgroundColor: '#e0f2fe',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    trackerSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: '#64748b',
    },
    etaBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#16a34a', // Matched ETA to green to emphasize approach
    },
    etaText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '800',
    },
    trackerRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    routePoint: {
        alignItems: 'center',
        gap: 6,
    },
    routeDot: {
        width: 14, height: 14,
        borderRadius: 999,
        backgroundColor: '#00a2ff',
    },
    routeDotDestination: {
        backgroundColor: '#16a34a', // Changed to Green User destination
    },
    routeLabel: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    routeLineContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 999,
        position: 'relative',
        marginHorizontal: 8,
        justifyContent: 'center',
    },
    routeProgressLine: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        backgroundColor: '#00a2ff',
        borderRadius: 999,
    },
    movingTrackerIcon: {
        position: 'absolute',
        width: 28, height: 28,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#00a2ff',
        alignItems: 'center',
        justifyContent: 'center',
        top: '50%',
        marginTop: -14,
        marginLeft: -14,
        zIndex: 10,
        shadowColor: '#00a2ff',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 3,
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 18,
    },
    sectionHeader: { gap: 4 },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    placeholderText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#334155',
    },
    markerBubble: {
        width: 34, height: 34,
        borderRadius: 17,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    markerInner: {
        width: 24, height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 