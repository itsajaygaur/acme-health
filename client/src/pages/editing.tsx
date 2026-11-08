import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import {
  ArrowLeft,
  Search,
  Bell,
  FileText,
  Users,
  BarChart,
  Clock,
  Undo,
  RotateCcw,
  Plus,
  Pencil,
  Eye,
  Edit,
  GripVertical,
  Trash2,
  X,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import NotificationBell from "./notification-bell";
import { fetchWithCredentials, getLoggedInUser } from "@/lib/utils";
import FullScreenLoader from "@/components/full-screen-loader";

type User = { id: number; name: string };

export default function Editing() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();
  const [jobCode, setJobCode] = useState("");
  const originalEssentialFunctions = [
    {
      id: 1,
      text: "Record Vital Signs And Immediately Escalate Critical Values",
      hasEdit: true,
    },
    {
      id: 2,
      text: "Aid With Patient Hygiene And Nutritional Needs",
      hasEdit: true,
    },
    {
      id: 3,
      text: "Maintain Patient Care Logs And Coordinate With Nursing Staff",
      hasEdit: true,
    },
    {
      id: 4,
      text: "Support Safe Patient Transport Within The Facility",
      hasEdit: true,
    },
  ];
  const [essentialFunctions, setEssentialFunctions] = useState(
    originalEssentialFunctions
  );
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [jobSummary, setJobSummary] = useState(
    "Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals."
  );
  const [originalJobSummary] = useState(
    "Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals."
  );
  const [isEditingJobSummary, setIsEditingJobSummary] = useState(false);
  const [trackChangesMode, setTrackChangesMode] = useState(true);
  const [changes, setChanges] = useState<
    Array<{ type: "delete" | "insert"; text: string; position: number }>
  >([]);
  const [showAddFunctionModal, setShowAddFunctionModal] = useState(false);
  const [newFunctionText, setNewFunctionText] = useState("");
  const [functionsHistory, setFunctionsHistory] = useState<
    Array<Array<{ id: number; text: string; hasEdit: boolean }>>
  >([]);
  const [editingFunctionId, setEditingFunctionId] = useState<number | null>(
    null
  );
  const [editingFunctionText, setEditingFunctionText] = useState("");
  const [originalEditingText, setOriginalEditingText] = useState("");
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [completeConfirmation, setCompleteConfirmation] = useState(false)
  const [lastUpdatedDate, setLastUpdatedDate] = useState("May 30, 2025");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [commentCategory, setCommentCategory] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      comment: "Record Vital Signs And Immediately Escalate Critical Values",
      category: "Critical",
      author: "John Smith",
      createdAt: "May 30, 2025",
      isEditable: true,
      isCritical: false
    },
    {
      id: 2,
      comment: "Aid With Patient Hygiene And Nutritional Needs",
      category: "Non-Critical",
      author: "Sarah Johnson",
      createdAt: "May 30, 2025",
      isEditable: false,
      isCritical: false
    },
    {
      id: 3,
      comment: "Maintain Patient Care Logs And Coordinate With Nursing Staff",
      category: "Non-Critical",
      author: "Michael Brown",
      createdAt: "May 30, 2025",
      isEditable: true,
      isCritical: false
    },
    {
      id: 4,
      comment: "Support Safe Patient Transport Within The Facility",
      category: "Non-Critical",
      author: "Emily Davis",
      createdAt: "May 30, 2025",
      isEditable: false,
      isCritical: false
    },
  ])


  // State for managing multiple last edited by users
  const [lastEditedByUsers, setLastEditedByUsers] = useState<User[]>([]);

  // State for managing reviewers
  const [reviewers, setReviewers] = useState<User[]>([]);

  // State for managing responsible users
  const [responsibleUsers, setResponsibleUsers] = useState<User[]>([]);

  // State to track if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  // State for Compare Versions modal
  const [showCompareModal, setShowCompareModal] = useState(false);

  // State for comments section
  const [additionalText, setAdditionalText] = useState("");
  // const [originalAdditionalText] = useState(
  //   "Additional requirements and considerations for this role may include specialized training, certifications, or equipment handling protocols."
  // );
  const [commentEditable, setCommentEditable] = useState<number | null>(null);
  const [showAdditionalTextCommentModal, setShowAdditionalTextCommentModal] =
    useState(false);
  const [additionalTextComment, setAdditionalTextComment] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [status, setStatus] = useState("In Progress");
  const [isCompleted, setIsCompleted] = useState(false);

  // State for Job Summary popup editor
  const [showJobSummaryPopup, setShowJobSummaryPopup] = useState(false);
  const [popupJobSummary, setPopupJobSummary] = useState("");
  const [popupOriginalJobSummary, setPopupOriginalJobSummary] = useState("");
  const [popupTrackChangesMode, setPopupTrackChangesMode] = useState(true);
  const [popupChanges, setPopupChanges] = useState<
    Array<{ type: "delete" | "insert"; text: string; position: number }>
  >([]);
  const [popupHistory, setPopupHistory] = useState<string[]>([]);
  const [showJobSummaryCloseConfirmation, setShowJobSummaryCloseConfirmation] =
    useState(false);



  const { data: availableUsers = []  } = useQuery<User[]>({
    queryFn: () => fetchWithCredentials(`/api/user-list`).then((res) => res.json()),
    queryKey: ["users"],
    enabled: !!jobCode,
  });

  const { data, isPending: isJobDescriptionDataPending } = useQuery({
    queryFn: () =>
      fetchWithCredentials(`/api/job-description/${jobCode}`).then((res) => res.json()),
    queryKey: ["job-description", jobCode],
    enabled: !!jobCode,
  });


  async function updateJobDescription(updateStatus: boolean = false){  
     const res =  await fetchWithCredentials(`/api/job-description`, {
        method: "PUT",
        body: JSON.stringify({
          jobId: data?.id,
          jobSummaryChanges: jobSummary,
          essentialFunctionsChanges: essentialFunctions.map((ef, i) => ({
            ...ef,
            sortOrder: i + 1,
          })),
          // responsibles: responsibleUsers.map((u) => u.id),
          reviewers: reviewers.map((u) => u.id),
          // isCritical: isCritical,
          comments: comments.filter(c => c.comment?.trim().length > 0),
          // reviewerId: JSON.parse(sessionStorage.getItem("user") || "{}")?.id,
          updateStatus 
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if(!res.ok){
        throw new Error('Failed')
      }
      
  }

  const updateJobDescriptionMutation = useMutation({
    mutationFn: ({ updateStatus }: { updateStatus: boolean }) => updateJobDescription(updateStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-description", jobCode] });
      toast({
        title: "Job description updated successfully",
      });
    },
  });

  const submitHRForReviewMutation = useMutation({
      mutationFn: async () => {
        // First update the job description
        await updateJobDescription();

        // Then submit it for HR review
        const response = await fetchWithCredentials(`/api/job/hr-review`, {
          method: "POST",
          body: JSON.stringify({
            jobId: data?.id,
            jobCode: jobCode,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Optionally throw if request fails (helps mutation's onError to trigger)
        if (!response.ok) {
          throw new Error("HR review submission failed");
        }
      },
      onSuccess: () => {
        setShowSubmitConfirmation(false);
        queryClient.invalidateQueries({ queryKey: ["job-description", jobCode] });
        toast({
          title: "Successfully submitted for HR review",
        });
      },
  });

const updateJobStatusMutation = useMutation({
  mutationFn: async () => {
    // Step 1: Update the job description
    await updateJobDescription();

    // Step 2: Mark job as completed
    const res = await fetchWithCredentials(`/api/job/status`, {
      method: "PUT",
      body: JSON.stringify({
        jobId: data?.id,
        newStatus: "Completed",
        jobCode,
        name: data?.lastEditedBy,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to update job status");
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["job-description", jobCode] });
    toast({
      title: "Marked as completed",
    });
  },
});


const acceptChangesMutation = useMutation({
  mutationFn: async () => {
    // Step 1: Update the job description
    await updateJobDescription();

    // Step 2: Accept changes
    const res = await fetchWithCredentials(`/api/job/accept-changes`, {
      method: "POST",
      body: JSON.stringify({
        jobId: data?.id,
        jobCode,
        name: data?.lastEditedBy,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to accept changes");
    }
  },
  onSuccess: () => {
    setShowAcceptConfirmation(false);
    queryClient.invalidateQueries({ queryKey: ["job-description", jobCode] });
    toast({
      title: "Accepted changes",
    });
  },
});




  // Available users for assignment
  // const availableUsers = [
  //   "John Smith",
  //   "Sarah Johnson",
  //   "Michael Brown",
  //   "Emily Davis",
  //   "David Wilson",
  //   "John Mark",
  //   "Sarah Mitchell",
  //   "Kelly Johnson",
  //   "Robert Kennedy",
  //   "Adam Lambert",
  //   "Jennifer Williams",
  //   "Michael Roberts",
  //   "Linda Taylor",
  //   "David Phillips",
  //   "Emma Sullivan",
  //   "Chris Harrison"
  // ];

  // Sample notifications matching dashboard
  const [notifications, setNotifications] = useState([
    "10001 was reviewed and needs your approval",
    "Review deadline approaching",
    "New job submitted 10002",
    "Status update required for 10003",
    "Feedback pending approval",
  ]);

  // Function to render notification text with job code links
  const renderNotificationWithLinks = (text: string) => {
    // Regex to match job codes (4-5 digit numbers)
    const jobCodeRegex = /\b(\d{4,5})\b/g;
    const parts = text.split(jobCodeRegex);

    return parts.map((part, index) => {
      // Check if this part is a job code
      if (/^\d{4,5}$/.test(part)) {
        return (
          <span
            key={index}
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowNotifications(false);
              window.location.href = `/editing?jobCode=${part}`;
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check for changes whenever relevant data changes
  useEffect(() => {
    checkForChanges();
  }, [jobSummary, essentialFunctions, isCritical]);

  // Get job code from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobCodeParam = urlParams.get("jobCode");
    if (jobCodeParam) {
      setJobCode(jobCodeParam);
    }
  }, []);

  // Functions for managing last edited by users
  const addUserToLastEditedBy = (user: User) => {
    if (!lastEditedByUsers.some((u) => u.id === user.id)) {
      setLastEditedByUsers((prev) => [...prev, user]);
    }
  };

  const removeUserFromLastEditedBy = (user: User) => {
    setLastEditedByUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Get available users that aren't already added to last edited by
  const getAvailableUsersForSelection = () => {
    return availableUsers?.filter(
      (user) => !lastEditedByUsers.some((u) => u.id === user.id)
    );
  };

  // Functions for managing reviewers
  const addReviewer = (user: User) => {
    if (!reviewers?.some((u) => u.id === user.id)) {
      setReviewers((prev) => [...prev, user]);
    }
  };

  const removeReviewer = (user: User) => {
    setReviewers((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Get available users that aren't already added to reviewers
  const getAvailableReviewers = () => {
    return Array.isArray(availableUsers) ? availableUsers?.filter(
      (user) => !reviewers.some((u) => u.id === user.id)
    ) : [];
  };

  // Functions for managing responsible users
  const addResponsibleUser = (user: User) => {
    if (!responsibleUsers?.some((u) => u.id === user.id)) {
      setResponsibleUsers((prev) => [...prev, user]);
    }
  };

  const removeResponsibleUser = (user: User) => {
    setResponsibleUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Get available users that aren't already added to responsible
  const getAvailableResponsibleUsers = () => {
    return availableUsers?.filter(
      (user) => !responsibleUsers?.some((u) => u.id === user.id)
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    // Save current state to history before making changes
    setFunctionsHistory((prev) => [...prev, [...essentialFunctions]]);

    const draggedFunction = essentialFunctions[draggedItem];
    const newFunctions = [...essentialFunctions];

    // Remove dragged item
    newFunctions.splice(draggedItem, 1);

    // Insert at new position
    newFunctions.splice(dropIndex, 0, draggedFunction);

    setEssentialFunctions(newFunctions);
    setDraggedItem(null);
  };

  // Function to create diff between original and current text
  const createTextDiff = (original: string, current: string) => {
    const originalWords = original.split(" ");
    const currentWords = current.split(" ");
    const result = [];
    let originalIndex = 0;
    let currentIndex = 0;

    while (
      originalIndex < originalWords.length ||
      currentIndex < currentWords.length
    ) {
      if (originalIndex >= originalWords.length) {
        // Remaining words are additions
        result.push({
          type: "insert",
          text: currentWords.slice(currentIndex).join(" "),
        });
        break;
      } else if (currentIndex >= currentWords.length) {
        // Remaining words are deletions
        result.push({
          type: "delete",
          text: originalWords.slice(originalIndex).join(" "),
        });
        break;
      } else if (originalWords[originalIndex] === currentWords[currentIndex]) {
        // Words match
        result.push({ type: "unchanged", text: originalWords[originalIndex] });
        originalIndex++;
        currentIndex++;
      } else {
        // Find next matching word
        let found = false;
        for (let i = currentIndex + 1; i < currentWords.length; i++) {
          if (originalWords[originalIndex] === currentWords[i]) {
            // Words between currentIndex and i are insertions
            result.push({
              type: "insert",
              text: currentWords.slice(currentIndex, i).join(" "),
            });
            currentIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          // Check if original word was deleted
          let foundInOriginal = false;
          for (let i = originalIndex + 1; i < originalWords.length; i++) {
            if (originalWords[i] === currentWords[currentIndex]) {
              // Words between originalIndex and i are deletions
              result.push({
                type: "delete",
                text: originalWords.slice(originalIndex, i).join(" "),
              });
              originalIndex = i;
              foundInOriginal = true;
              break;
            }
          }
          if (!foundInOriginal) {
            // Replace: delete original, insert current
            result.push({ type: "delete", text: originalWords[originalIndex] });
            result.push({ type: "insert", text: currentWords[currentIndex] });
            originalIndex++;
            currentIndex++;
          }
        }
      }
    }

    return result;
  };

  const renderTrackedChanges = () => {
    // Always show clean text in the main view, regardless of track changes mode
    return <p className="text-sm mb-4">{jobSummary}</p>;
  };

  const handleAddNewFunction = () => {
    if (newFunctionText.trim()) {
      const newFunction = {
        id: essentialFunctions.length + 1,
        text: newFunctionText.trim(),
        hasEdit: true,
      };
      setEssentialFunctions([...essentialFunctions, newFunction]);
      setNewFunctionText("");
      setShowAddFunctionModal(false);
    }
  };

  const handleCancelAddFunction = () => {
    setNewFunctionText("");
    setShowAddFunctionModal(false);
  };

  const handleUndoMove = () => {
    if (functionsHistory.length > 0) {
      const previousState = functionsHistory[functionsHistory.length - 1];
      setEssentialFunctions(previousState);
      setFunctionsHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleResetFunctions = () => {
    // Reset to original database state
    // setEssentialFunctions([...originalEssentialFunctions]);
    setEssentialFunctions(data?.essentialFunctionsAi?.map(
        (ef: {
          functionText: string;
        }, id: number) => ({
          //id: ef.sortOrder,
          id: id,
          text: ef.functionText,
          hasEdit: true,
        })
      ) || [] || []);
    setFunctionsHistory([]);
  };

  const handleResetJobSummary = () => {
    // Reset job summary to original database state
    setJobSummary(data?.jobSummaryAi);
    setIsEditingJobSummary(false);
  };

  const handleEditFunction = (functionId: number, currentText: string) => {
    setEditingFunctionId(functionId);
    setEditingFunctionText(currentText);
    setOriginalEditingText(currentText);
  };

  const handleSaveEditFunction = () => {
    if (editingFunctionId !== null && editingFunctionText.trim()) {
      const updatedFunctions = essentialFunctions.map((func) =>
        func.id === editingFunctionId
          ? { ...func, text: editingFunctionText.trim() }
          : func
      );
      setEssentialFunctions(updatedFunctions);
      setEditingFunctionId(null);
      setEditingFunctionText("");
    }
  };

  const handleCancelEditFunction = () => {
    setEditingFunctionId(null);
    setEditingFunctionText("");
    setOriginalEditingText("");
    setShowCloseConfirmation(false);
  };

  const handleCloseEditModal = () => {
    const hasChanges = editingFunctionText !== originalEditingText;
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      handleCancelEditFunction();
    }
  };

  const confirmCloseEditModal = () => {
    handleCancelEditFunction();
  };

  const updateLastModifiedDate = () => {
    const today = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = `${
      monthNames[today.getMonth()]
    } ${today.getDate()}, ${today.getFullYear()}`;
    setLastUpdatedDate(formattedDate);
  };

  const handleSaveDraft = () => {
    updateLastModifiedDate();
  };

  const handleSubmitForReview = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmitForReview = () => {
    // updateLastModifiedDate();

    // // Add notification with the current job number
    // const currentJobCode = jobCode || "10001"; // Use actual job code or fallback
    // const newNotification = `${currentJobCode} was reviewed and needs your approval`;
    // setNotifications((prev) => [newNotification, ...prev]);

  };

  // const cancelSubmitForReview = () => {
  //   setShowSubmitConfirmation(false);
  // };

  const handleAcceptChanges = () => {
    setShowAcceptConfirmation(true);
  };

  const handleConfirmAcceptChanges = () => {
    updateLastModifiedDate();
    setShowAcceptConfirmation(false);
    // Logic to accept all changes and finalize the job description
    // console.log("All changes accepted and finalized");
  };

  // const handleCancelAcceptChanges = () => {
  //   setShowAcceptConfirmation(false);
  // };

  const handleCompareVersions = async () => {
    try {
      // setShowCompareModal(true);
      // await updateJobDescription();
      await updateJobDescriptionMutation.mutateAsync({updateStatus: false});
      setLocation(
        `/compare-versions?lastUpdated=${encodeURIComponent(
          lastUpdatedDate
        )}&jobCode=${encodeURIComponent(jobCode)}`
      );
      
    } catch (error) {
      toast({title: "Failed to update job description", variant: "destructive"});
    }
  };

  const handleComplete = () => {
    updateLastModifiedDate();
    setStatus("Complete");
    setIsCompleted(true);
    // console.log("Job description marked as complete");
    updateJobStatusMutation.mutate();
  };

  // const handleEditAdditionalText = () => {
  //   setIsEditingAdditionalText(true);
  // };

  // const handleSaveAdditionalText = () => {
  //   setIsEditingAdditionalText(false);
  //   updateLastModifiedDate();
  // };

  // const handleCancelAdditionalText = () => {
  //   // setAdditionalText(originalAdditionalText);
  //   setIsEditingAdditionalText(false);
  // };

  const handleAdditionalTextComment = () => {
    setShowAdditionalTextCommentModal(true);
  };

  const handleSaveAdditionalTextComment = () => {
    // Save the comment functionality here
    // console.log("Additional text comment saved:", additionalTextComment);
    setShowAdditionalTextCommentModal(false);
    // setAdditionalTextComment("");
  };

  // Helper function to count words
  const countWords = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Handle Job Summary edit - always open popup
  const handleEditJobSummary = () => {
    // Always open popup for text editing
    setPopupJobSummary(jobSummary);
    setPopupOriginalJobSummary(data?.jobSummaryAi);
    setPopupHistory([jobSummary]);
    setPopupChanges([]);
    setShowJobSummaryPopup(true);
  };

  // Handle popup job summary changes with track changes
  const handlePopupJobSummaryChange = (newText: string) => {
    if (popupTrackChangesMode) {
      // Add to history before making changes
      setPopupHistory((prev) => [...prev, popupJobSummary]);
    }

    setPopupJobSummary(newText);
  };

  // Create highlighted diff display for popup left pane
  const renderPopupTrackedChanges = () => {
    if (!popupTrackChangesMode || popupJobSummary === popupOriginalJobSummary) {
      return (
        <div className="h-[640px] max-h-[calc(100vh-300px)] border border-gray-300 rounded-md bg-gray-50 p-3 overflow-y-auto">
          <div
            className="text-sm"
            style={{
              lineHeight: "1.5",
              fontFamily: "Arial, sans-serif",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {popupOriginalJobSummary}
          </div>
        </div>
      );
    }

    // Create sophisticated word-level diff using LCS algorithm
    const originalWords = popupOriginalJobSummary?.split(/(\s+)/);
    const currentWords = popupJobSummary?.split(/(\s+)/);

    // Longest Common Subsequence algorithm for better diff detection
    const lcs = (arr1: string[], arr2: string[]) => {
      const m = arr1.length;
      const n = arr2.length;
      const dp = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (arr1[i - 1] === arr2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Backtrack to find the actual changes
      const changes = [];
      let i = m,
        j = n;

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
          changes.unshift({ type: "unchanged", text: arr1[i - 1] });
          i--;
          j--;
        } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
          changes.unshift({ type: "delete", text: arr1[i - 1] });
          i--;
        } else {
          changes.unshift({ type: "insert", text: arr2[j - 1] });
          j--;
        }
      }

      return changes;
    };

    const changes = lcs(originalWords, currentWords);

    return (
      <div className="h-[640px] max-h-[calc(100vh-300px)] border border-gray-300 rounded-md bg-gray-50 p-3 overflow-y-auto">
        <div
          className="text-sm"
          style={{
            lineHeight: "1.5",
            fontFamily: "Arial, sans-serif",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {changes.map((change, index) => {
            if (change.type === "unchanged") {
              return <span key={index}>{change.text}</span>;
            } else if (change.type === "delete") {
              return (
                <span
                  key={index}
                  className="bg-red-100 text-red-700 line-through decoration-red-500"
                  title="Deleted text"
                >
                  {change.text}
                </span>
              );
            } else if (change.type === "insert") {
              return (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 font-medium"
                  title="Added text"
                >
                  {change.text}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  // Handle popup undo
  const handlePopupUndo = () => {
    if (popupHistory.length > 1) {
      const newHistory = [...popupHistory];
      newHistory.pop(); // Remove current state
      const previousState = newHistory[newHistory.length - 1];
      setPopupJobSummary(previousState);
      setPopupHistory(newHistory);
    }
  };

  // Handle popup OK
  const handlePopupOK = () => {
    setJobSummary(popupJobSummary);
    setShowJobSummaryPopup(false);
    updateLastModifiedDate();
  };

  // Handle popup Cancel
  const handlePopupCancel = () => {
    setPopupJobSummary(popupOriginalJobSummary);
    setShowJobSummaryPopup(false);
  };

  // Handle close confirmation
  const handleConfirmJobSummaryClose = () => {
    setShowJobSummaryCloseConfirmation(false);
    handlePopupCancel();
  };

  const handleCancelJobSummaryClose = () => {
    setShowJobSummaryCloseConfirmation(false);
  };

  const handleCancelAdditionalTextComment = () => {
    setAdditionalTextComment("");
    setShowAdditionalTextCommentModal(false);
  };

  const loggedInUser = getLoggedInUser()

  useEffect(() => {
    setResponsibleUsers(data?.responsibles || []);
    setReviewers(data?.reviewers || []);
    setJobSummary(data?.jobSummaryChanges || "");
    // setIsCritical(data?.isCritical || false);
    // setAdditionalText(data?.otherJobDescription || "");
    setAdditionalTextComment(data?.comments || "")
    setComments(data?.comments || [])
    setIsCompleted(data?.status === "Completed" || data?.status === "Accepted As Is" || ((data?.status === "Submitted to HR" && !loggedInUser.group?.split(':')?.includes('hrleader')) ? true : false) );
    setEssentialFunctions(
      data?.essentialFunctionsChanges?.map(
        (ef: {
          sortOrder: number;
          hasEdit: boolean;
          functionText: string;
          id: number;
        }) => ({
          //id: ef.sortOrder,
          id: ef.id,
          text: ef.functionText,
          hasEdit: ef.hasEdit,
        })
      ) || []
    );
  }, [data]);

    // Function to check for changes
    
    const checkForChanges = () => {
    const summaryChanged = jobSummary !== data?.jobSummaryAi;
    const isCriticalChanged = isCritical !== data?.isCritical;
    
    const functionChanges = JSON.stringify(essentialFunctions) !== JSON.stringify( data?.essentialFunctionsChanges?.map(
        (ef: {
          sortOrder: number;
          hasEdit: boolean;
          functionText: string;
          id: number;
        }) => ({
          //id: ef.sortOrder,
          id: ef.id,
          text: ef.functionText,
          hasEdit: ef.hasEdit,
        })
      ))

  const essentialFunctionChanged =   JSON.stringify(essentialFunctions.map(c => ({text: c.text}))) !== JSON.stringify(data?.essentialFunctionsAi?.map((ef: {
                        functionText: string;
                      }) => ({
                        text: ef.functionText,
                      })
                    ))
    // Check if job summary has changed
    // const essentialFunctionChanged = functionChanges || functionAiChanges
    const hasAnyChanges =
      summaryChanged ||
      essentialFunctionChanged ||
      isCriticalChanged
    setHasChanges(hasAnyChanges);
  };

  const deleteEssentialFunction = useMutation({
    mutationFn: (functionId: number) =>
      fetchWithCredentials(`/api/job/essentialfunction/${functionId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-description", jobCode] });

      toast({
        title: "Successfully deleted essential function",
      });
    },
    onError: (err) => {
      // console.log(err);
      toast({
        title: "Failed to delete essential function",
        variant: "destructive",
      });
    },
  });

  // Call this function to delete an essential function by id
  const handleDeleteFunction = (functionId: number) => {
    // console.log("Deleting function with ID:", functionId);
    // deleteEssentialFunction.mutate(functionId);
    setEssentialFunctions((prev) => prev.filter((func) => func.id !== functionId));
  };

  if(isJobDescriptionDataPending) return <FullScreenLoader />

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Edit className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Job Description Review
                </h1>
                {jobCode && (
                  <p className="text-sm text-gray-600 mt-1">
                    Job Code: {jobCode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>

          {/* Back Button */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  // Clear all cached data and force refresh
                  queryClient.invalidateQueries();
                  setLocation("/jobs");
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

          {/* Job Information Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Job Title
                </span>
              </div>
              <p className="text-blue-600 font-semibold">{data?.jobTitle}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Job Family
                </span>
              </div>
              <p className="text-blue-600 font-semibold">{data?.jobFamily}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
              </div>
              <Badge
                className={
                  data?.status === "Complete"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {data?.status}
              </Badge>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Last Edited By
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {data?.lastEditedBy || "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Functional Leaders
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-50"
                      disabled={
                        getAvailableReviewers()?.length === 0 || isCompleted
                      }
                    >
                      <UserPlus className="w-3 h-3 text-green-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {getAvailableReviewers()?.map((user) => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => addReviewer(user)}
                        className="cursor-pointer"
                      >
                        {user.name}
                      </DropdownMenuItem>
                    ))}
                    {getAvailableReviewers()?.length === 0 && (
                      <DropdownMenuItem disabled>
                        All users added
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                {reviewers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 px-2 py-1 rounded"
                  >
                    <span className="text-green-700 font-medium text-sm">
                      {user.name}
                    </span>
                    {reviewers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-red-100"
                        onClick={() => removeReviewer(user)}
                        title={`Remove ${user}`}
                        disabled={isCompleted}
                      >
                        <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Responsible
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-purple-50"
                      disabled={
                        getAvailableResponsibleUsers()?.length === 0 ||
                        isCompleted
                      }
                    >
                      <UserPlus className="w-3 h-3 text-purple-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {getAvailableResponsibleUsers()?.map((user) => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => addResponsibleUser(user)}
                        className="cursor-pointer"
                      >
                        {user.name}
                      </DropdownMenuItem>
                    ))}
                    {getAvailableResponsibleUsers()?.length === 0 && (
                      <DropdownMenuItem disabled>
                        All users added
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                {responsibleUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-purple-50 px-2 py-1 rounded"
                  >
                    <span className="text-purple-700 font-medium text-sm">
                      {user.name}
                    </span>
                    {responsibleUsers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-red-100"
                        onClick={() => removeResponsibleUser(user)}
                        title={`Remove ${user}`}
                        disabled={isCompleted}
                      >
                        <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Last Updated
                </span>
              </div>
              <p className="text-blue-600 font-semibold">{data?.lastUpdated}</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Original Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">
                    Original Job Description
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  {/* <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    </div> */}
                  <p className="text-sm">{data?.jobSummaryOriginal}</p>
                  {/* <p className="text-sm">
                      • Provides Direct Patient Care Under Supervision. Monitors
                      Patient Condition And Reports
                    </p>
                    <p className="text-sm">
                      • Changes To The Medical Team. Maintains Accurate Records
                      And Assists With Mobility Needs.
                    </p> */}
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Essential Functions</h4>
                  <ol className="space-y-2 text-sm">
                    {data?.essentialFunctionsOriginal?.map(
                      (func: { functionText: string }, index: number) => (
                        <li key={index} className="list-decimal list-inside">
                          {func.functionText}
                        </li>
                      )
                    )}
                  </ol>
                </div>
                <div >
                 <h4 className="font-semibold mb-3">Other Job Description</h4>
                  <pre className="text-sm whitespace-pre-wrap break-words" style={{fontFamily: "Inter, sans-serif"}} >{data?.otherJobDescription}</pre>
                </div>

                {/* <div className="text-sm text-gray-600 leading-relaxed">
                  <p>
                    The Patient Care Technician (PCT) Is A Key Member Of The
                    Clinical Team Responsible For Delivering Foundational
                    Support To Patients And Clinical Staff. Under The Guidance
                    Of Licensed Nursing Personnel, The PCT Assists With Direct
                    Patient Care To Meet Each Patient's Physical And Emotional
                    Conditions, And Ensures A Clean, Safe, And Healing-Centered
                    Environment.
                  </p>
                </div> */}
              </div>
            </div>

            {/* AI-Generated Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">
                      Updated Job Description
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Last Updated {data?.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Job Summary</h4>
                    <div className="flex items-center space-x-2">
                      {/* <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="track-changes"
                          checked={trackChangesMode}
                          onChange={(e) =>
                            setTrackChangesMode(e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          disabled={isCompleted}
                        />
                        <label
                          htmlFor="track-changes"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Track Changes
                        </label>
                      </div> */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditJobSummary}
                        disabled={isCompleted}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger disabled={isCompleted || jobSummary === data?.jobSummaryAi}>
                          <Button
                            size="sm"
                            variant="ghost"
                            // onClick={handleResetJobSummary}
                            disabled={isCompleted || jobSummary === data?.jobSummaryAi}
                            title="Reset to original job summary"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset to Original</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reset the job summary to
                              the original?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetJobSummary}
                              disabled={isCompleted}
                            >
                              Reset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetJobSummary}
                        disabled={isCompleted}
                        title="Reset to original job summary"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </div>
                  {isEditingJobSummary ? (
                    <div className="space-y-2">
                      <Textarea
                        value={jobSummary}
                        onChange={(e) => setJobSummary(e.target.value)}
                        className="text-sm min-h-[80px]"
                        placeholder="Enter job summary..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsEditingJobSummary(false);
                            if (trackChangesMode) {
                              setTrackChangesMode(true);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setJobSummary(originalJobSummary);
                            setIsEditingJobSummary(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    renderTrackedChanges()
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Essential Functions</h4>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleUndoMove}
                        disabled={functionsHistory.length === 0 || isCompleted}
                        title="Undo last move"
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger 
                           disabled={isCompleted || JSON.stringify(essentialFunctions.map(c => ({text: c.text}))) === JSON.stringify(data?.essentialFunctionsAi?.map((ef: {
                        functionText: string;
                      }) => ({
                        text: ef.functionText,
                      })
                    ))}
                    >
                          <Button
                            size="sm"
                            variant="ghost"
                            // onClick={handleResetFunctions}
                           disabled={isCompleted || JSON.stringify(essentialFunctions.map(c => ({text: c.text}))) === JSON.stringify(data?.essentialFunctionsAi?.map((ef: {
                        functionText: string;
                      }) => ({
                        text: ef.functionText,
                      })
                    ))}
                            title="Reset to original functions"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset to Original</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reset the essential
                              functions to the original?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetFunctions}
                              disabled={isCompleted}
                            >
                              Reset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetFunctions}
                        title="Reset to original functions"
                        disabled={isCompleted}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {essentialFunctions.map((func, index) => (
                      <div
                        key={func.id}
                        className={`flex items-start space-x-3 p-2 bg-gray-50 rounded ${
                          isCompleted
                            ? "cursor-default"
                            : "cursor-move hover:bg-gray-100"
                        } transition-colors`}
                        draggable={!isCompleted}
                        onDragStart={
                          !isCompleted
                            ? (e) => handleDragStart(e, index)
                            : undefined
                        }
                        onDragOver={!isCompleted ? handleDragOver : undefined}
                        onDrop={
                          !isCompleted ? (e) => handleDrop(e, index) : undefined
                        }
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1 flex items-start justify-between">
                          <p
                            className={`text-sm ${
                              func.hasEdit ? "font-medium" : ""
                            } flex-1 pr-2`}
                          >
                            {func.text}
                          </p>
                          {/* {func.hasEdit && ( */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto min-w-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFunction(func.id, func.text);
                              }}
                              disabled={isCompleted}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          {/* )} */}
                          {/* {func.hasEdit && ( */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto min-w-0"
                              onClick={(e) => {
                                handleDeleteFunction(func.id);
                              }}
                              disabled={isCompleted}
                              title="Delete essential function"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          {/* )} */}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setShowAddFunctionModal(true)}
                      disabled={isCompleted}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Function
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">
                      Comments
                    </h4>
                    <div className="flex items-center space-x-3">
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        // onClick={handleEditAdditionalText}
                        title="Edit comments"
                        disabled={isCompleted}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button> */}

                              <Button size="sm" disabled={isCompleted} onClick={() => {
                                if(commentEditable){
                                  return
                                }
                                const generatedId = Date.now();
                                setComments(prev => [
                                  {
                                    id: Date.now(),
                                    category: "",
                                    comment: "",
                                    author: "",
                                    createdAt: '',
                                    isEditable: true,
                                    isCritical: false
                                  },
                                  ...prev,
                                ]);
                                setCommentEditable(generatedId);
                                setAdditionalTextComment("");
                                
                              }} className="flex items-center gap-2">
                                <Plus  /> Add Comment
                              </Button>
                    </div>
                  </div>

<div className="space-y-4">

  {comments?.map((comment, index) => (
    <div
      key={index}
      className="bg-white shadow-sm rounded-xl border border-gray-200 p-4"
    >
      {commentEditable === comment.id ? (
        <div className="space-y-4">
          {/* Category Selector */}
          <div className="flex gap-4 items-end" >
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select defaultValue={comment.category} onValueChange={(value) => setCommentCategory(value)}>
                <SelectTrigger className="w-[200px] h-9 mt-1">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem value="generic">Generic</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    {/* <SelectItem value="apple">Generic</SelectItem>
                    <SelectItem value="banana"></SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem> */}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

              <div className="flex items-center space-x-2 mb-2" title="Please note, we are currently working on updating content related to the Other Job Description.  Please only check this box if the comment below is related to a field in the Other Job Description section that needs to be addressed prior to January 1st, 2026." >
                <input
                  type="checkbox"
                  id="critical-checkbox"
                  defaultChecked={comment.isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="h-4 w-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  disabled={isCompleted}
                />
                <label
                  htmlFor="critical-checkbox"
                  className="text-sm font-medium cursor-pointer text-red-600"
                >
                  Critical
                </label>
              </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Comment
            </label>
            <Textarea
              value={additionalTextComment}
              disabled={!commentCategory && !comment.category}
              onChange={(e) => setAdditionalTextComment(e.target.value)}
              className="min-h-[120px] resize-none mt-1"
              placeholder="Write your comment..."
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCommentEditable(null)
                setCommentCategory("")
                setAdditionalTextComment("")
                if(!comment.comment?.trim()){
                  setComments(prev => prev.filter(c => c.id !== comment.id))
                }
              }}
            >
              Cancel
            </Button>
            <Button 
                size="sm" 
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={(!commentCategory) || (!additionalTextComment?.trim()) } 
                onClick={() => {
                  setComments(prev => prev.map(c => {
                    if(c.id === comment.id){
                      return {...c, comment: additionalTextComment, isCritical: isCritical, category: commentCategory}
                    }
                    return c
                  }))
                  setCommentEditable(null)
                  setAdditionalTextComment("")
                  setCommentCategory("")
                }}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            {/* Meta Info */}
            <div className="flex flex-col gap-1">
              <div>

              {comment.category && <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full w-fit">
                {comment.category}
              </span>}
              {comment.isCritical && 
              <span className="inline-flex items-center text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full ml-2" >
                Critical
              </span>}
              </div>
              <div className="flex gap-2 text-xs text-gray-500 items-center">
                { comment.author && 
                <>
                <p>{comment.author}</p>
                <span>•</span>
                </>
                }
                <p>{comment.createdAt}</p>
              </div>
            </div>


            {
              comment.isEditable &&
            <div>

            {/* Edit Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>  {
                setAdditionalTextComment(comment.comment) 
                setCommentCategory(comment.category)
                setCommentEditable(comment.id); 
              }}
              className="h-8 w-8 rounded-full"
              disabled={isCompleted}
            >

              <Pencil className="h-4 w-4" />
            </Button>
            {/* Delete Icon */}


              <AlertDialog>
                <AlertDialogTrigger disabled={isCompleted} >
                  <Button
                    size="icon"
                    variant="ghost"
                    // onClick={() => setComments(prev => prev.filter(c => c.id !== comment.id))}
                    className="h-8 w-8 rounded-full"
                    disabled={isCompleted}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this comment?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => setComments(prev => prev.filter(c => c.id !== comment.id))}>
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>


        
            </div>
            }

          </div>

          {/* Comment Text */}
          <p className="text-gray-800 leading-relaxed">{comment.comment}</p>
        </div>
      )}
    </div>
  ))}

</div>

                 

                    {/* {isEditingAdditionalText ? (
                      <div className="space-y-3">
                        <Textarea
                          value={additionalTextComment}
                          onChange={(e) => setAdditionalTextComment(e.target.value)}
                          className="min-h-[120px] resize-none"
                          placeholder="Add comments here..."
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelAdditionalText}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveAdditionalText}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <p className="text-sm text-gray-500 leading-relaxed italic">
                          {additionalTextComment ||
                            "Add comments here..."}
                        </p>
                      </div>
                    )} */}


                </div>
              </div>
            </div>
          </div>
            

                      
          {/* Action Buttons */}
          <div className="w-fit mx-auto mt-8">
            <div className="space-x-4" >

            <Button
              variant="outline"
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              // onClick={handleSaveDraft}
              onClick={() => updateJobDescriptionMutation.mutate({updateStatus: true})}
              disabled={updateJobDescriptionMutation.isPending || isCompleted}
            >
              {updateJobDescriptionMutation.isPending
                ? "Saving..."
                : "Save Draft"}
            </Button>
            {!isAdminMode && (
              <Button
                className="bg-blue-900 text-white hover:bg-blue-800"
                // onClick={handleSubmitForReview}
                onClick={() => setShowSubmitConfirmation(true)}
                disabled={submitHRForReviewMutation.isPending || isCompleted}
              >
                {submitHRForReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit For HR Review"}
              </Button>
            )}
            {!isAdminMode && (
              <Button
                className={`disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed
                  bg-blue-600 text-white hover:bg-blue-700`}
                // onClick={handleAcceptChanges}
                onClick={() => setShowAcceptConfirmation(true)}
                disabled={acceptChangesMutation.isPending || isCompleted || hasChanges}
                // disabled={hasChanges || isCritical || acceptChangesMutation.isPending}
              >
                {
                  acceptChangesMutation.isPending ? "Accepting..." :
                  "Accept As Is"
                }
              </Button>
            )}
            {isAdminMode && (
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={() => setCompleteConfirmation(true)}
                disabled={
                  updateJobDescriptionMutation.isPending ||
                  updateJobStatusMutation.isPending ||
                  isCompleted
                }
              >
                {isCompleted ? "Finished" : "Complete"}
              </Button>
            )}
            <Button
              variant="outline"
              className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
              onClick={handleCompareVersions}
              disabled={updateJobDescriptionMutation.isPending}
            >
              {
                updateJobDescriptionMutation.isPending ? "Please wait..." : "Compare Versions"
              }
              {/* Compare Versions */}
            </Button>
            </div>
            <p className="text-xs mt-2 text-gray-600 text-center" >Changes won&apos;t be saved unless you click <b> Save Draft. </b></p>

          </div>


        </div>
      </main>

      {/* Add New Function Modal */}
      <Dialog
        open={showAddFunctionModal}
        onOpenChange={(open) => {
          if (!open) {
            // Prevent closing unless explicitly cancelled or saved
            return;
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Essential Function</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="function-text" className="text-sm font-medium">
                Function Description
              </label>
              <Textarea
                id="function-text"
                value={newFunctionText}
                onChange={(e) => setNewFunctionText(e.target.value)}
                placeholder="Enter the new essential function description..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelAddFunction}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNewFunction}
              disabled={!newFunctionText.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Function Modal */}
      <Dialog
        open={editingFunctionId !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEditModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Essential Function</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="edit-function-text"
                className="text-sm font-medium"
              >
                Function Description
              </label>
              <Textarea
                id="edit-function-text"
                value={editingFunctionText}
                onChange={(e) => setEditingFunctionText(e.target.value)}
                placeholder="Enter the function description..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelEditFunction}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditFunction}
              disabled={!editingFunctionText.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to lose your changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseEditModal}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit For Review Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit For HR Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this job description for HR
              review? This will notify the HR team for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={submitHRForReviewMutation.isPending} onClick={() => submitHRForReviewMutation.mutate()}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Changes Confirmation Dialog */}
      <AlertDialog open={showAcceptConfirmation} onOpenChange={setShowAcceptConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Changes cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={acceptChangesMutation.isPending} onClick={() => acceptChangesMutation.mutate()}>
              Accept Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog on click of Complete Button */}
      <AlertDialog open={completeConfirmation} onOpenChange={setCompleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* <AlertDialogTitle>Complete this Job</AlertDialogTitle> */}
            <AlertDialogDescription className="text-black text-base" >
              Please confirm all updates have been completed. Once the edits have been submitted it cannot be retrieved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={updateJobStatusMutation.isPending} onClick={handleComplete}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Additional Text Comment Modal */}
      <Dialog
        open={showAdditionalTextCommentModal}
        onOpenChange={() => {
          // Prevent closing unless explicitly cancelled or saved
          return;
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="additional-text-comment"
                className="text-sm font-medium"
              >
                Comment
              </label>
              <Textarea
                id="additional-text-comment"
                value={additionalTextComment}
                onChange={(e) => setAdditionalTextComment(e.target.value)}
                placeholder="Enter your comment here..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelAdditionalTextComment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAdditionalTextComment}
              // disabled={!additionalTextComment?.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Compare Versions
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-full p-6 pt-0 gap-6">
            {/* Original Job Description Box */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Original Job Description
                </h3>
                <p className="text-sm text-gray-500">
                  Last modified: May 15, 2025
                </p>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Job Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Job Summary
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {originalJobSummary}
                      </p>
                    </div>
                  </div>

                  {/* Essential Functions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Essential Functions
                    </h4>
                    <div className="space-y-3">
                      {originalEssentialFunctions.map((func, index) => (
                        <div
                          key={func.id}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">
                              {func.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Comments
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 italic">
                        {data?.comments}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Version Box */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Current Version
                </h3>
                <p className="text-sm text-gray-500">
                  Last modified: {lastUpdatedDate}
                </p>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Job Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Job Summary
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{jobSummary}</p>
                    </div>
                  </div>

                  {/* Essential Functions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Essential Functions
                    </h4>
                    <div className="space-y-3">
                      {essentialFunctions.map((func, index) => (
                        <div
                          key={func.id}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">
                              {func.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Comments
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 italic">
                        {additionalText || "Add comments here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 pt-0 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCompareModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Summary Popup Editor */}
      <Dialog
        open={showJobSummaryPopup}
        onOpenChange={(open) => {
          if (!open) {
            // Handle X button click
            const hasChanges = popupJobSummary !== popupOriginalJobSummary;
            if (hasChanges) {
              // Show confirmation dialog instead of alert
              setShowJobSummaryCloseConfirmation(true);
            } else {
              // No changes, allow closing
              handlePopupCancel();
            }
          }
        }}
      >
        <DialogContent
          className="max-w-6xl max-h-[95vh] h-[95vh] flex flex-col overflow-hidden"
          aria-describedby="job-summary-editor-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Job Summary</DialogTitle>
            <div id="job-summary-editor-description" className="sr-only">
              Edit job summary with track changes and undo functionality
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4">
            {/* Track Changes Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="popup-track-changes"
                  checked={popupTrackChangesMode}
                  onChange={(e) => setPopupTrackChangesMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="popup-track-changes"
                  className="text-sm font-medium cursor-pointer"
                >
                  Track Changes
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePopupUndo}
                  disabled={popupHistory.length <= 1}
                  title="Undo last change"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  Word Count: {countWords(popupJobSummary)}
                </span>
              </div>
            </div>

            {/* Side by Side Editor and Preview */}
            <div className="flex-1 flex gap-4">
              {/* Left Side - Read-only with Change Tracking */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-sm font-medium mb-2">
                  Original (with Changes)
                </h4>
                {renderPopupTrackedChanges()}
              </div>

              {/* Right Side - Editable */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-sm font-medium mb-2">Editor</h4>
                <Textarea
                  value={popupJobSummary}
                  onChange={(e) => handlePopupJobSummaryChange(e.target.value)}
                  className="h-[640px] max-h-[calc(100vh-300px)] text-sm resize-none border border-gray-300"
                  placeholder="Edit job summary here..."
                  style={{
                    lineHeight: "1.5",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handlePopupCancel}>
              Cancel
            </Button>
            <Button
              onClick={handlePopupOK}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Summary Close Confirmation Dialog */}
      <AlertDialog
        open={showJobSummaryCloseConfirmation}
        onOpenChange={setShowJobSummaryCloseConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelJobSummaryClose}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmJobSummaryClose}>
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
