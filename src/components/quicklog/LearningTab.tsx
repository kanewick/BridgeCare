import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { colors, spacing, radius, theme } from "../../theme";
import { IconDisplay } from "../IconDisplay";
import { Card } from "../Card";
import { Badge } from "../Badge";

interface LearningTabProps {
  testID?: string;
}

interface LearningResource {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon?: string;
  category: "care-tips" | "procedures" | "emergency" | "communication";
  priority: "low" | "normal" | "high";
  estimatedMinutes: number;
  content: string;
  tags: string[];
}

interface ResourceCardProps {
  resource: LearningResource;
  onPress: () => void;
  isExpanded?: boolean;
}

const CATEGORY_CONFIG = {
  "care-tips": { label: "Care Tips", emoji: "💡", color: "primary" },
  procedures: { label: "Procedures", emoji: "📋", color: "secondary" },
  emergency: { label: "Emergency", emoji: "🚨", color: "error" },
  communication: { label: "Communication", emoji: "💬", color: "success" },
} as const;

// Mock learning resources
const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: "dementia-communication",
    title: "Communicating with Dementia Residents",
    description: "Best practices for clear, respectful communication",
    emoji: "💬",
    icon: "chatbubbles-outline",
    category: "communication",
    priority: "high",
    estimatedMinutes: 3,
    content: `Key Communication Tips for Dementia Care:

• **Use simple, clear language** - Speak slowly and use short sentences
• **Make eye contact** - Helps establish connection and trust
• **Be patient** - Allow extra time for responses
• **Use positive body language** - Smile, gentle touch when appropriate
• **Validate feelings** - Even if the content isn't accurate, acknowledge emotions
• **Redirect rather than correct** - Avoid arguing about reality

**Example Phrases:**
❌ "You already ate lunch"
✅ "Let's see what's available in the kitchen"

❌ "Your husband died years ago"
✅ "Tell me about your husband. What was he like?"

**Red Flags:**
• Increasing agitation during conversation
• Repeated questions (may indicate anxiety)
• Withdrawal from interaction

**Remember:** Every person with dementia is unique. What works for one may not work for another.`,
    tags: ["dementia", "communication", "behavior"],
  },
  {
    id: "safe-transfers",
    title: "Safe Transfer Techniques",
    description: "Preventing falls and injuries during mobility assistance",
    emoji: "🚶",
    icon: "walk-outline",
    category: "procedures",
    priority: "high",
    estimatedMinutes: 5,
    content: `Safe Transfer Protocol:

**Before Every Transfer:**
• Check transfer plan in care notes
• Ensure path is clear of obstacles
• Use appropriate assistive devices
• Get help if resident requires 2-person assist

**Step-by-Step:**
1. **Explain** what you're going to do
2. **Position** yourself close to resident
3. **Use proper body mechanics** - legs, not back
4. **Let resident help** as much as possible
5. **Move slowly** and pause if needed
6. **Ensure stability** before letting go

**Equipment Checks:**
• Wheelchair brakes engaged
• Bed at proper height
• Call bell within reach after transfer

**When to Stop:**
• Resident reports pain or dizziness
• You feel unsafe continuing
• Equipment malfunction

**Always document:**
• Transfer method used
• Resident's tolerance
• Any issues or concerns`,
    tags: ["mobility", "safety", "transfers"],
  },
  {
    id: "medication-safety",
    title: "Medication Administration Safety",
    description: "5 Rights and common medication errors to avoid",
    emoji: "💊",
    icon: "medical-outline",
    category: "procedures",
    priority: "high",
    estimatedMinutes: 4,
    content: `The 5 Rights of Medication Administration:

1. **Right Person** - Check ID band and ask name
2. **Right Medication** - Verify against MAR
3. **Right Dose** - Double-check calculations
4. **Right Route** - Oral, topical, injection site
5. **Right Time** - Within 30-minute window

**Common Errors to Avoid:**
• Looking away during medication prep
• Mixing medications together without checking
• Crushing tablets that shouldn't be crushed
• Not staying with resident until medication is swallowed

**Red Flags:**
• Resident refuses medication (document, don't force)
• Medication looks different than usual
• Resident reports allergies
• Signs of medication reaction

**Documentation Requirements:**
• Time given
• Route administered
• Resident's response
• Any refusals or concerns

**Emergency Contacts:**
• Pharmacist: Available 24/7
• On-call physician: For medication questions
• Poison Control: 1-800-222-1222`,
    tags: ["medication", "safety", "administration"],
  },
  {
    id: "fall-prevention",
    title: "Fall Prevention Strategies",
    description: "Identifying and reducing fall risks",
    emoji: "⚠️",
    icon: "alert-circle-outline",
    category: "care-tips",
    priority: "high",
    estimatedMinutes: 3,
    content: `Fall Prevention Checklist:

**Environmental Safety:**
• Remove throw rugs and clutter
• Ensure adequate lighting
• Check that call bells are within reach
• Verify grab bars are secure
• Keep beds at lowest setting

**Personal Factors:**
• Review medications that cause dizziness
• Encourage proper footwear (non-slip)
• Assess vision and hearing needs
• Monitor for changes in balance

**High-Risk Times:**
• Getting up at night (toileting)
• After meals (blood pressure changes)
• After medications (especially sedatives)
• During weather changes

**Intervention Strategies:**
• Scheduled toileting to reduce urgency
• Gradual position changes (sit before standing)
• Regular exercise to maintain strength
• Hip protectors for high-risk residents

**When a Fall Occurs:**
1. Don't move resident immediately
2. Assess for injury
3. Call for help
4. Document thoroughly
5. Review and update care plan`,
    tags: ["falls", "prevention", "safety"],
  },
  {
    id: "infection-control",
    title: "Infection Control Basics",
    description: "Hand hygiene and preventing disease spread",
    emoji: "🧼",
    icon: "brush-outline",
    category: "procedures",
    priority: "normal",
    estimatedMinutes: 2,
    content: `Hand Hygiene Protocol:

**When to Wash Hands:**
• Before resident contact
• After resident contact
• Before and after meals
• After bathroom assistance
• After removing gloves
• Before medication administration

**Proper Handwashing:**
1. Wet hands with warm water
2. Apply soap and lather for 20 seconds
3. Clean under nails and between fingers
4. Rinse thoroughly
5. Dry with clean towel

**Hand Sanitizer Use:**
• When hands aren't visibly soiled
• 60%+ alcohol content
• Cover all surfaces of hands
• Rub until dry (about 20 seconds)

**PPE Guidelines:**
• Change gloves between residents
• Dispose of gloves properly
• Never reuse disposable items
• Report any PPE shortages

**Signs of Infection:**
• Fever or temperature changes
• New or worsening cough
• Unusual fatigue
• Changes in appetite
• Skin changes or wounds`,
    tags: ["infection-control", "hygiene", "ppe"],
  },
  {
    id: "emergency-response",
    title: "Emergency Response Procedures",
    description: "What to do in medical emergencies",
    emoji: "🚨",
    icon: "alert-outline",
    category: "emergency",
    priority: "high",
    estimatedMinutes: 4,
    content: `Emergency Action Steps:

**Life-Threatening Emergencies:**
1. **Call 911 immediately**
2. **Start CPR if needed** (and trained)
3. **Alert charge nurse/supervisor**
4. **Stay with resident** until help arrives
5. **Document everything**

**Common Emergencies:**

**Choking:**
• Encourage coughing if conscious
• Back blows between shoulder blades
• Heimlich maneuver if trained
• Call 911 if can't clear airway

**Falls with Injury:**
• Don't move resident
• Check for responsiveness
• Look for obvious injuries
• Keep warm and comfortable
• Monitor vital signs

**Chest Pain:**
• Keep resident calm and still
• Loosen tight clothing
• Give nitroglycerin if prescribed
• Monitor breathing and pulse

**Allergic Reactions:**
• Remove/stop suspected allergen
• Give antihistamine if ordered
• Watch for breathing difficulties
• Use EpiPen if prescribed

**Key Phone Numbers:**
• 911: Emergency services
• Poison Control: 1-800-222-1222
• Facility emergency line: [Posted at nurses station]`,
    tags: ["emergency", "response", "procedures"],
  },
];

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPress,
  isExpanded = false,
}) => {
  const categoryConfig = CATEGORY_CONFIG[resource.category];

  return (
    <Card style={styles.resourceCard}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.resourceHeader}>
          <View style={styles.resourceMeta}>
            <IconDisplay
              emoji={resource.emoji}
              icon={resource.icon}
              size={20}
              color={colors.primary}
            />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDescription}>
                {resource.description}
              </Text>
            </View>
          </View>

          <View style={styles.resourceActions}>
            <Badge color={categoryConfig.color} size="small">
              {categoryConfig.emoji} {categoryConfig.label}
            </Badge>
            <Text style={styles.timeEstimate}>
              {resource.estimatedMinutes} min
            </Text>
            <IconDisplay
              emoji={isExpanded ? "⬆️" : "⬇️"}
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSecondary}
              useIcons={true}
            />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.resourceContent}>
          <Text style={styles.contentText}>{resource.content}</Text>

          {resource.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {resource.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

export const LearningTab: React.FC<LearningTabProps> = ({
  testID = "learning-tab",
}) => {
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleResourcePress = (resourceId: string) => {
    setExpandedResource(expandedResource === resourceId ? null : resourceId);
  };

  const filteredResources = LEARNING_RESOURCES.filter(
    (resource) =>
      selectedCategory === "all" || resource.category === selectedCategory
  );

  const categories = [
    { id: "all", label: "All", emoji: "📚" },
    ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      id: key,
      label: config.label,
      emoji: config.emoji,
    })),
  ];

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <IconDisplay
            emoji="🎯"
            icon="school-outline"
            size={24}
            color={colors.primary}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Learning & Resources</Text>
            <Text style={styles.headerSubtitle}>
              Quick access to care tips and procedures
            </Text>
          </View>
        </View>
      </Card>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedCategory === category.id && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === category.id &&
                    styles.activeFilterButtonText,
                ]}
              >
                {category.emoji} {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resources List */}
      <ScrollView style={styles.resourcesContainer}>
        {filteredResources.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconDisplay emoji="📖" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Resources Found</Text>
            <Text style={styles.emptyText}>
              Try selecting a different category to see more resources.
            </Text>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onPress={() => handleResourcePress(resource.id)}
              isExpanded={expandedResource === resource.id}
            />
          ))
        )}

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: colors.surface,
  },
  resourcesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  resourceCard: {
    marginBottom: spacing.md,
  },
  resourceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: spacing.md,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resourceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  resourceActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  timeEstimate: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
  },
  resourceContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  footer: {
    height: spacing.xl,
  },
});
