/**
 * Helper library to optimize imports and facilitate tree shaking.
 * By importing only specific parts of libraries and exporting them,
 * we help bundlers like Vite better identify and eliminate unused code.
 */

// Chart components - selective imports from recharts to optimize bundle size
// Uncomment and use these imports if recharts is installed
/*
export { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
*/

// Selectively import only needed Lucide icons to reduce bundle size
// Instead of importing the entire library with: import * as LucideIcons from 'lucide-react'
import { 
  Heart, 
  Calendar, 
  Activity, 
  User, 
  Settings, 
  Home, 
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Minus,
  Check,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Mail,
  AlertCircle,
  Clock,
  MessageSquare,
  Video,
  Phone,
  MoreVertical,
  Upload,
  Download,
  Shield,
  Users,
  FileText,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

export const Icons = {
  Heart,
  Calendar,
  Activity,
  User,
  Settings,
  Home,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Minus,
  Check,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Mail,
  AlertCircle,
  Clock,
  MessageSquare,
  Video,
  Phone,
  MoreVertical,
  Upload,
  Download,
  Shield,
  Users,
  FileText,
  CreditCard,
  ShoppingCart
};