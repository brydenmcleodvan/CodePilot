import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, Users, Heart, Plus, Minus, PlusCircle, MinusCircle, 
  UserPlus, ChevronRight, ChevronDown, MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  imageUrl?: string;
  health?: {
    conditions: Array<{
      name: string;
      inherited: boolean;
      severity: 'low' | 'moderate' | 'high';
    }>;
  };
  parents?: {
    motherId?: string;
    fatherId?: string;
  };
  children?: string[];
  spouses?: Array<{
    id: string;
    current: boolean;
  }>;
  siblings?: string[];
}

interface FamilyLink {
  source: string;
  target: string;
  type: 'parent-child' | 'spouse' | 'sibling';
  current?: boolean;
}

interface FamilyTreeProps {
  initialMembers?: FamilyMember[];
  currentUserId?: string;
  onMemberClick?: (member: FamilyMember) => void;
  viewOnly?: boolean;
}

const DEFAULT_FAMILY: FamilyMember[] = [
  { 
    id: "user1", 
    name: "John Doe", 
    gender: "male", 
    birthDate: "1980-05-15",
    health: {
      conditions: [
        { name: "Hypertension", inherited: true, severity: "moderate" },
        { name: "Type 2 Diabetes Risk", inherited: true, severity: "low" }
      ]
    },
    spouses: [{ id: "user2", current: true }],
    children: ["user3", "user4"],
    parents: { fatherId: "user5", motherId: "user6" }
  },
  { 
    id: "user2", 
    name: "Sarah Doe", 
    gender: "female", 
    birthDate: "1982-08-20",
    health: {
      conditions: [
        { name: "Vitamin D Deficiency", inherited: true, severity: "moderate" },
        { name: "Allergy Sensitivity", inherited: true, severity: "moderate" }
      ]
    },
    spouses: [{ id: "user1", current: true }],
    children: ["user3", "user4"]
  },
  { 
    id: "user3", 
    name: "Emma Doe", 
    gender: "female", 
    birthDate: "2015-03-12",
    health: {
      conditions: [
        { name: "Asthma", inherited: true, severity: "high" },
        { name: "Vitamin D Deficiency", inherited: true, severity: "low" }
      ]
    },
    parents: { fatherId: "user1", motherId: "user2" },
    siblings: ["user4"]
  },
  { 
    id: "user4", 
    name: "Tommy Doe", 
    gender: "male", 
    birthDate: "2018-11-05",
    health: {
      conditions: [
        { name: "Allergy Sensitivity", inherited: true, severity: "moderate" },
        { name: "Cardiovascular Risk", inherited: true, severity: "low" }
      ]
    },
    parents: { fatherId: "user1", motherId: "user2" },
    siblings: ["user3"]
  },
  { 
    id: "user5", 
    name: "Robert Doe", 
    gender: "male", 
    birthDate: "1950-06-22",
    health: {
      conditions: [
        { name: "Hypertension", inherited: true, severity: "high" },
        { name: "Elevated Cholesterol", inherited: true, severity: "moderate" },
        { name: "Early Heart Disease", inherited: true, severity: "moderate" }
      ]
    },
    spouses: [{ id: "user6", current: true }],
    children: ["user1"]
  },
  { 
    id: "user6", 
    name: "Mary Doe", 
    gender: "female", 
    birthDate: "1953-09-30",
    health: {
      conditions: [
        { name: "Type 2 Diabetes", inherited: true, severity: "moderate" },
        { name: "Osteoporosis", inherited: true, severity: "moderate" }
      ]
    },
    spouses: [{ id: "user5", current: true }],
    children: ["user1"]
  }
];

// Create links from family members data
const generateLinks = (members: FamilyMember[]): FamilyLink[] => {
  const links: FamilyLink[] = [];
  
  // Add parent-child links
  members.forEach(member => {
    if (member.children) {
      member.children.forEach(childId => {
        links.push({
          source: member.id,
          target: childId,
          type: 'parent-child'
        });
      });
    }
  });
  
  // Add spouse links
  members.forEach(member => {
    if (member.spouses) {
      member.spouses.forEach(spouse => {
        // Only add each spouse relationship once
        const existingLink = links.find(link => 
          (link.source === member.id && link.target === spouse.id) || 
          (link.source === spouse.id && link.target === member.id)
        );
        
        if (!existingLink) {
          links.push({
            source: member.id,
            target: spouse.id,
            type: 'spouse',
            current: spouse.current
          });
        }
      });
    }
  });
  
  return links;
};

// Function to find member by ID
const findMemberById = (members: FamilyMember[], id: string): FamilyMember | undefined => {
  return members.find(member => member.id === id);
};

const FamilyTree: React.FC<FamilyTreeProps> = ({ 
  initialMembers = DEFAULT_FAMILY,
  currentUserId = "user1",
  onMemberClick,
  viewOnly = false
}) => {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [focusedMemberId, setFocusedMemberId] = useState<string>(currentUserId);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showHealthInfo, setShowHealthInfo] = useState<boolean>(true);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    gender: 'male',
    name: '',
  });
  const [relationshipType, setRelationshipType] = useState<'child' | 'parent' | 'spouse' | 'sibling'>('child');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([currentUserId]));
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const focusedMember = findMemberById(members, focusedMemberId);
  const links = generateLinks(members);
  
  // Function to toggle expanded state of a node
  const toggleNodeExpansion = (id: string) => {
    const currentExpanded = Array.from(expandedNodes);
    const newExpanded = new Set(currentExpanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };
  
  // Function to handle member click
  const handleMemberClick = (member: FamilyMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    } else {
      setFocusedMemberId(member.id);
    }
  };
  
  // Function to handle adding a new member
  const handleAddMember = () => {
    const newId = `user${members.length + 1}`;
    const newMemberData: FamilyMember = {
      id: newId,
      name: newMember.name || 'New Member',
      gender: newMember.gender || 'other',
      birthDate: newMember.birthDate,
      health: {
        conditions: []
      }
    };
    
    // Update existing members based on relationship
    const updatedMembers = [...members];
    
    if (relationshipType === 'child') {
      // Add child relationship
      newMemberData.parents = { 
        fatherId: focusedMember?.gender === 'male' ? focusedMember.id : undefined,
        motherId: focusedMember?.gender === 'female' ? focusedMember.id : undefined
      };
      
      // Find spouse if current member has one
      if (focusedMember?.spouses && focusedMember.spouses.length > 0) {
        const currentSpouse = focusedMember.spouses.find(s => s.current);
        if (currentSpouse) {
          const spouse = findMemberById(members, currentSpouse.id);
          if (spouse) {
            if (spouse.gender === 'male') {
              newMemberData.parents = { ...newMemberData.parents, fatherId: spouse.id };
            } else if (spouse.gender === 'female') {
              newMemberData.parents = { ...newMemberData.parents, motherId: spouse.id };
            }
            
            // Update spouse's children array
            const spouseIndex = updatedMembers.findIndex(m => m.id === spouse.id);
            if (spouseIndex >= 0) {
              updatedMembers[spouseIndex] = {
                ...updatedMembers[spouseIndex],
                children: [...(updatedMembers[spouseIndex].children || []), newId]
              };
            }
          }
        }
      }
      
      // Update focused member's children array
      const focusedIndex = updatedMembers.findIndex(m => m.id === focusedMemberId);
      if (focusedIndex >= 0) {
        updatedMembers[focusedIndex] = {
          ...updatedMembers[focusedIndex],
          children: [...(updatedMembers[focusedIndex].children || []), newId]
        };
      }
      
    } else if (relationshipType === 'spouse') {
      // Add spouse relationship
      newMemberData.spouses = [{ id: focusedMemberId, current: true }];
      
      // Update focused member's spouses array
      const focusedIndex = updatedMembers.findIndex(m => m.id === focusedMemberId);
      if (focusedIndex >= 0) {
        // Set any existing 'current' spouses to not current
        const updatedSpouses = updatedMembers[focusedIndex].spouses?.map(s => ({
          ...s,
          current: false
        })) || [];
        
        updatedMembers[focusedIndex] = {
          ...updatedMembers[focusedIndex],
          spouses: [...updatedSpouses, { id: newId, current: true }]
        };
      }
      
    } else if (relationshipType === 'parent') {
      // Add parent relationship
      newMemberData.children = [focusedMemberId];
      
      // Update focused member's parents
      const focusedIndex = updatedMembers.findIndex(m => m.id === focusedMemberId);
      if (focusedIndex >= 0) {
        updatedMembers[focusedIndex] = {
          ...updatedMembers[focusedIndex],
          parents: {
            ...updatedMembers[focusedIndex].parents,
            fatherId: newMemberData.gender === 'male' ? newId : updatedMembers[focusedIndex].parents?.fatherId,
            motherId: newMemberData.gender === 'female' ? newId : updatedMembers[focusedIndex].parents?.motherId
          }
        };
      }
    } else if (relationshipType === 'sibling') {
      // Add sibling relationship (same parents as focused member)
      newMemberData.parents = { ...focusedMember?.parents };
      newMemberData.siblings = [...(focusedMember?.siblings || []), focusedMemberId];
      
      // Update focused member's siblings
      const focusedIndex = updatedMembers.findIndex(m => m.id === focusedMemberId);
      if (focusedIndex >= 0) {
        updatedMembers[focusedIndex] = {
          ...updatedMembers[focusedIndex],
          siblings: [...(updatedMembers[focusedIndex].siblings || []), newId]
        };
      }
      
      // Update parents' children arrays
      if (newMemberData.parents?.fatherId) {
        const fatherIndex = updatedMembers.findIndex(m => m.id === newMemberData.parents?.fatherId);
        if (fatherIndex >= 0) {
          updatedMembers[fatherIndex] = {
            ...updatedMembers[fatherIndex],
            children: [...(updatedMembers[fatherIndex].children || []), newId]
          };
        }
      }
      
      if (newMemberData.parents?.motherId) {
        const motherIndex = updatedMembers.findIndex(m => m.id === newMemberData.parents?.motherId);
        if (motherIndex >= 0) {
          updatedMembers[motherIndex] = {
            ...updatedMembers[motherIndex],
            children: [...(updatedMembers[motherIndex].children || []), newId]
          };
        }
      }
    }
    
    // Add the new member to the array
    setMembers([...updatedMembers, newMemberData]);
    
    // Reset the form
    setNewMember({
      gender: 'male',
      name: '',
    });
    setShowAddDialog(false);
    
    // Expand the node for the focused member
    setExpandedNodes(new Set(Array.from(expandedNodes).concat([focusedMemberId])));
  };
  
  // Function to get the severity color
  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to render the member node
  const renderMemberNode = (memberId: string, level = 0) => {
    const member = findMemberById(members, memberId);
    if (!member) return null;
    
    const isExpanded = expandedNodes.has(memberId);
    const isFocused = focusedMemberId === memberId;
    const hasFather = !!member.parents?.fatherId;
    const hasMother = !!member.parents?.motherId;
    const hasChildren = member.children && member.children.length > 0;
    const hasSpouses = member.spouses && member.spouses.length > 0;
    const canExpand = hasFather || hasMother || hasChildren || hasSpouses;
    
    return (
      <div key={memberId} className="mb-4">
        <div className={`flex flex-col relative ${level > 0 ? 'ml-8' : ''}`}>
          {/* Member node */}
          <motion.div 
            className={`flex items-center gap-2 p-3 rounded-md shadow-sm border ${
              isFocused ? 'bg-primary/10 border-primary' : 'bg-card'
            } hover:bg-primary/5 transition-colors`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Expand/collapse button for nodes with relatives */}
            {canExpand && (
              <button
                onClick={() => toggleNodeExpansion(memberId)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            
            {/* Member avatar */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                ${member.gender === 'male' ? 'bg-blue-500' : 
                  member.gender === 'female' ? 'bg-pink-500' : 'bg-purple-500'}`}
              onClick={() => handleMemberClick(member)}
            >
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name.substring(0, 2)
              )}
            </div>
            
            <div className="flex-1" onClick={() => handleMemberClick(member)}>
              <h3 className="font-medium text-sm">{member.name}</h3>
              <p className="text-xs text-muted-foreground">
                {member.birthDate && `b. ${new Date(member.birthDate).getFullYear()}`}
                {member.deathDate && ` - d. ${new Date(member.deathDate).getFullYear()}`}
              </p>
            </div>
            
            {/* Health indicators */}
            {showHealthInfo && member.health?.conditions && member.health.conditions.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      {member.health.conditions.some(c => c.severity === 'high') && (
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      )}
                      {member.health.conditions.some(c => c.severity === 'moderate') && (
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                      {member.health.conditions.some(c => c.severity === 'low') && (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-1">
                      <p className="font-semibold text-sm mb-1">Health Conditions:</p>
                      <ul className="space-y-1 text-xs">
                        {member.health.conditions.map((condition, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${getSeverityColor(condition.severity)}`}>
                              {condition.severity}
                            </span>
                            <span>{condition.name}</span>
                            {condition.inherited && <Heart size={10} className="text-red-500" />}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Actions menu */}
            {!viewOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setRelationshipType('child');
                    setShowAddDialog(true);
                  }}>
                    Add Child
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setRelationshipType('spouse');
                    setShowAddDialog(true);
                  }}>
                    Add Spouse
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setRelationshipType('parent');
                    setShowAddDialog(true);
                  }}>
                    Add Parent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setRelationshipType('sibling');
                    setShowAddDialog(true);
                  }}>
                    Add Sibling
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => {
                      // Here you would implement the delete functionality
                      alert('Delete functionality would be implemented here');
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
          
          {/* Expanded view with relatives */}
          {isExpanded && (
            <div className="mt-2 pl-4 border-l-2 border-dashed border-gray-300">
              {/* Parents section */}
              {(hasFather || hasMother) && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Parents</p>
                  <div className="space-y-2">
                    {hasFather && renderMemberNode(member.parents!.fatherId!, level + 1)}
                    {hasMother && renderMemberNode(member.parents!.motherId!, level + 1)}
                  </div>
                </div>
              )}
              
              {/* Siblings section */}
              {member.siblings && member.siblings.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Siblings</p>
                  <div className="space-y-2">
                    {member.siblings.map(siblingId => renderMemberNode(siblingId, level + 1))}
                  </div>
                </div>
              )}
              
              {/* Spouses section */}
              {hasSpouses && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Spouses</p>
                  <div className="space-y-2">
                    {member.spouses!.map(spouse => renderMemberNode(spouse.id, level + 1))}
                  </div>
                </div>
              )}
              
              {/* Children section */}
              {hasChildren && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Children</p>
                  <div className="space-y-2">
                    {member.children!.map(childId => renderMemberNode(childId, level + 1))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="relative">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Family Tree</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            >
              <Minus size={16} />
            </Button>
            <span className="text-sm w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            >
              <Plus size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHealthInfo(!showHealthInfo)}
              className={showHealthInfo ? 'bg-primary/10' : ''}
            >
              <Heart size={16} className="mr-1" />
              Health
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef}
            className="family-tree-container overflow-auto p-4 rounded-lg bg-gray-50 min-h-[500px]"
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'top left',
              height: `${Math.max(500, 500 / zoomLevel)}px`
            }}
          >
            <div className="inline-block min-w-full">
              {renderMemberNode(focusedMemberId)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Family Member</DialogTitle>
            <DialogDescription>
              {relationshipType === 'child' && `Add a child to ${focusedMember?.name}`}
              {relationshipType === 'spouse' && `Add a spouse for ${focusedMember?.name}`}
              {relationshipType === 'parent' && `Add a parent for ${focusedMember?.name}`}
              {relationshipType === 'sibling' && `Add a sibling for ${focusedMember?.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="gender" className="text-right">
                Gender
              </label>
              <select
                id="gender"
                value={newMember.gender}
                onChange={(e) => setNewMember({...newMember, gender: e.target.value as 'male' | 'female' | 'other'})}
                className="col-span-3 p-2 border rounded"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="birthdate" className="text-right">
                Birth Date
              </label>
              <input
                id="birthdate"
                type="date"
                value={newMember.birthDate || ''}
                onChange={(e) => setNewMember({...newMember, birthDate: e.target.value})}
                className="col-span-3 p-2 border rounded"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add {relationshipType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { FamilyTree };
export default FamilyTree;