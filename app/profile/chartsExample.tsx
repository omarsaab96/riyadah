import * as d3Shape from "d3-shape";
import { useLanguage } from '@/context/language';
import React, { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function DynamicLineChart({data = [],labels = []}) {
    const { isRTL } = useLanguage();
    const [chartWidth, setChartWidth] = useState(0);
    const height = 200;

    const PADDING_TOP = 20;
    const PADDING_BOTTOM = 20;
    const innerHeight = height - PADDING_TOP - PADDING_BOTTOM;

    if (!data.length) return null;

    const barWidth = chartWidth > 0 ? chartWidth / data.length : 0;
    const maxValue = Math.max(...data);
    const finalMax = Math.max(maxValue, 100);

    const [activeIndex, setActiveIndex] = useState(data.length - 1);
    const [isDragging, setIsDragging] = useState(false);

    // Use refs for values that change frequently
    const activeIndexRef = useRef(activeIndex);
    const chartWidthRef = useRef(chartWidth);

    // Update refs when state changes
    React.useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    React.useEffect(() => {
        chartWidthRef.current = chartWidth;
    }, [chartWidth]);

    // ---------------------------------------------------------------------
    // FIXED PAN RESPONDER - USING GESTURE STATE
    // ---------------------------------------------------------------------
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (evt, gestureState) => {
                setIsDragging(true);
                handleTouch(gestureState.x0);
            },

            onPanResponderMove: (evt, gestureState) => {
                handleTouch(gestureState.moveX);
            },

            onPanResponderRelease: () => {
                setIsDragging(false);
            },

            onPanResponderTerminate: () => {
                setIsDragging(false);
            },
        })
    ).current;

    const handleTouch = (xPosition) => {
        const currentBarWidth = chartWidthRef.current / data.length;
        if (currentBarWidth <= 0 || !chartWidthRef.current) return;

        const index = Math.floor(xPosition / currentBarWidth);
        const clampedIndex = Math.min(data.length - 1, Math.max(0, index));

        // console.log('Touch at:', xPosition, 'Bar width:', currentBarWidth, 'Index:', clampedIndex);

        if (clampedIndex !== activeIndexRef.current) {
            setActiveIndex(clampedIndex);
        }
    };

    // ---------------------------------------------------------------------
    // CURVE GENERATION
    // ---------------------------------------------------------------------
    const line = useMemo(() => {
        if (!chartWidth || !data.length) return "";
        return d3Shape
            .line()
            .x((_, i) => i * barWidth + barWidth / 2)
            .y((v) =>
                PADDING_TOP + innerHeight - (v / finalMax) * innerHeight
            )
            .curve(d3Shape.curveMonotoneX)(data);
    }, [chartWidth, data, barWidth, innerHeight, finalMax]);

    // Tooltip position
    const tooltipX = activeIndex * barWidth + barWidth / 2;
    const tooltipY =
        PADDING_TOP +
        innerHeight -
        (data[activeIndex] / finalMax) * innerHeight;

    // ---------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------
    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>} */}

            <View style={styles.chartWrapper}>
                {/* Main container for layout measurement */}
                <View
                    style={styles.layoutContainer}
                    onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        // console.log('Chart width set to:', width);
                        setChartWidth(width);
                    }}
                >
                    {/* SVG Chart */}
                    {chartWidth > 0 && (
                        <Svg width={chartWidth} height={height}>
                            {/* Background Bars */}
                            {data.map((_, i) => (
                                <Rect
                                    key={i}
                                    x={i * barWidth}
                                    y={0}
                                    width={barWidth}
                                    height={height}
                                    fill={i === activeIndex ? '#FF9432' : i % 2 === 0 ? '#FFE8D3' : '#FFF8F1'}
                                    opacity={0.8}
                                    rx={6}
                                />
                            ))}

                            {/* Line Path */}
                            <Path d={line} stroke={'#FF4400'} strokeWidth={3} fill="none" />

                            {/* Active Point */}
                            <Circle
                                cx={tooltipX}
                                cy={tooltipY}
                                r={8}
                                fill={'#FF4400'}
                                stroke="white"
                                strokeWidth={3}
                            />

                            {/* Visual indicator for active bar */}
                            {/* <Rect
                                x={activeIndex * barWidth}
                                y={0}
                                width={barWidth}
                                height={height}
                                fill="transparent"
                                stroke={primaryColor}
                                strokeWidth={3}
                                rx={6}
                            /> */}
                        </Svg>
                    )}

                    {/* Tooltip */}
                    <View
                        pointerEvents="none"
                        style={[
                            styles.tooltip,
                            {
                                pointerEvents:'none',
                                left: tooltipX - 20,
                                top: Math.max(10, data[activeIndex] > 60 ? tooltipY + 15 : tooltipY - 45),
                                transform: [{ scale: isDragging ? 1.1 : 1 }],
                            },
                        ]}
                    >
                        <Text style={styles.tooltipValue}>
                            {data[activeIndex]}
                        </Text>
                    </View>

                    {/* Touch overlay - MUST be last to capture touches */}
                    <View
                        style={styles.touchOverlay}
                        {...panResponder.panHandlers}
                    />
                </View>
            </View>

            {/* Labels */}
            <View style={[styles.labelsContainer, { width: chartWidth }]}>
                {labels.map((label, i) => {
                    const x = i * barWidth + barWidth / 2;
                    const isActive = i === activeIndex;
                    const labelLeft = isRTL ? Math.max(0, chartWidth - x - 25) : x - 25;

                    return (
                        <Text
                            key={i}
                            style={[
                                styles.label,
                                {
                                    left: labelLeft,
                                    color: isActive ? '#FF4400' : "#9CA3AF",
                                    fontWeight: isActive ? "800" : "400",
                                    fontSize: isActive ? 13 : 12,
                                    transform: [{ scale: isActive ? 1.1 : 1 }],
                                }
                            ]}
                        >
                            {label}
                        </Text>
                    );
                })}
            </View>

            {/* Debug info */}
            {/* <Text style={styles.debugText}>
                Active Index: {activeIndex} | Value: {data[activeIndex]} | Dragging: {isDragging ? "YES" : "NO"} | Chart Width: {chartWidth}
            </Text> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: "#fff",
    },
    chartWrapper: {
        width: "100%",
        height: 200,
        position: "relative",
    },
    layoutContainer: {
        width: "100%",
        height: "100%",
        position: "relative",
        // backgroundColor: "transparent",
    },
    touchOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },
    subtitle: {
        textAlign: "center",
        color: "#9CA3AF",
        marginBottom: 16,
        fontSize: 14,
    },
    labelsContainer: {
        marginTop: 12,
        position: "relative",
        height: 20,
    },
    label: {
        position: "absolute",
        width: 50,
        textAlign: "center",
    },
    tooltip: {
        position: "absolute",
        backgroundColor: "#000",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 6,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        width: 40,
    },
    tooltipValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
        textAlign: "center"
    },
    debugText: {
        textAlign: "center",
        color: "#666",
        fontSize: 10,
        marginTop: 8,
        fontFamily: "monospace",
    },
});
