import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors, radius, spacing, shadow, theme } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Header } from "../../components/Header";
import { ResidentCard } from "../../components/ResidentCard";
import { SearchBar } from "../../components/SearchBar";
import { StatusType } from "../../components/StatusChip";
import { useFeedStore } from "../../store/feedStore";
import { RootStackParamList } from "../../navigation/AppNavigator";

type ResidentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const StaffResidentsScreen: React.FC = () => {
  const navigation = useNavigation<ResidentsScreenNavigationProp>();
  const { residents, activeResidentId, setActiveResident, currentRole } =
    useFeedStore();

  const [searchQuery, setSearchQuery] = useState("");
  const contentContainerStyle = useContentContainerStyle();

  const handleResidentSelect = (residentId: string) => {
    setActiveResident(residentId);

    if (currentRole === "staff") {
      // Navigate to resident detail screen for staff
      navigation.navigate("ResidentDetail", { residentId });
    } else {
      // For family users, just set the active resident (they stay in their own tabs)
      // Family users access resident info through their ResidentProfile tab
    }
  };

  // Filter residents based on search query
  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return residents;

    const query = searchQuery.toLowerCase().trim();
    return residents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(query) ||
        (resident.room && resident.room.toLowerCase().includes(query))
    );
  }, [residents, searchQuery]);

  // Determine resident status (for demo purposes - in real app this would come from data)
  const getResidentStatus = (residentId: string): StatusType => {
    // For demo: make every 3rd resident inactive, every 7th restricted
    const index = residents.findIndex((r) => r.id === residentId);
    if (index % 7 === 0) return "restricted";
    if (index % 3 === 0) return "inactive";
    return "active";
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const activeResidents = filteredResidents.filter(
    (r) => getResidentStatus(r.id) === "active"
  );
  const inactiveResidents = filteredResidents.filter(
    (r) => getResidentStatus(r.id) === "inactive"
  );
  const restrictedResidents = filteredResidents.filter(
    (r) => getResidentStatus(r.id) === "restricted"
  );

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Header
          title="Residents"
          subtitle={`${residents.length} resident${
            residents.length !== 1 ? "s" : ""
          } in care`}
          showSettings={true}
        />

        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
          />

          {/* Results Summary */}
          {searchQuery.trim() && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsText}>
                {filteredResidents.length} result
                {filteredResidents.length !== 1 ? "s" : ""} found
              </Text>
            </View>
          )}

          {/* Active Residents */}
          {activeResidents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Active Residents ({activeResidents.length})
              </Text>
              {activeResidents.map((resident) => (
                <ResidentCard
                  key={resident.id}
                  resident={resident}
                  isSelected={activeResidentId === resident.id}
                  onPress={() => handleResidentSelect(resident.id)}
                  status="active"
                />
              ))}
            </View>
          )}

          {/* Inactive Residents */}
          {inactiveResidents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Inactive Residents ({inactiveResidents.length})
              </Text>
              {inactiveResidents.map((resident) => (
                <ResidentCard
                  key={resident.id}
                  resident={resident}
                  isSelected={activeResidentId === resident.id}
                  onPress={() => handleResidentSelect(resident.id)}
                  status="inactive"
                />
              ))}
            </View>
          )}

          {/* Restricted Residents */}
          {restrictedResidents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Restricted Access ({restrictedResidents.length})
              </Text>
              {restrictedResidents.map((resident) => (
                <ResidentCard
                  key={resident.id}
                  resident={resident}
                  isSelected={activeResidentId === resident.id}
                  onPress={() => handleResidentSelect(resident.id)}
                  status="restricted"
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {filteredResidents.length === 0 && searchQuery.trim() && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateText}>No residents found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search terms
              </Text>
            </View>
          )}

          {/* No residents at all */}
          {residents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateText}>No residents yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Residents will appear here once added to the system
              </Text>
            </View>
          )}

          {/* Bottom padding for better scroll experience */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  background: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  searchResults: {
    marginBottom: spacing.lg,
  },
  searchResultsText: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    fontWeight: "500",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.textWarm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxxl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    ...shadow.sm,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  emptyStateText: {
    ...theme.typography.sectionTitle,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyStateSubtext: {
    ...theme.typography.body,
    color: colors.textFaint,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
