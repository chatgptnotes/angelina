import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, DollarSign, Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { BOQService } from '../services/boqService';
import type { BOQProject } from '../types/boq';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<BOQProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await BOQService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Show demo data if no Supabase
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    processing: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    sent: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 bg-gradient-to-r from-angelina-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI-Powered BOQ Extraction</h2>
            <p className="text-angelina-100 max-w-xl">
              Upload 3D renders or 2D design documents. AI extracts Bill of Quantities automatically.
              Reduce estimation time from <strong>1 week to 1 day</strong>.
            </p>
          </div>
          <Link
            to="/new"
            className="flex items-center gap-2 px-5 py-3 bg-white text-angelina-700 rounded-xl font-semibold hover:bg-angelina-50 transition-colors shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            New BOQ Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-xs text-angelina-200">Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'processing').length}</div>
            <div className="text-xs text-angelina-200">Processing</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'approved').length}</div>
            <div className="text-xs text-angelina-200">Approved</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              ₹{(projects.reduce((s, p) => s + (p.total_estimate || 0), 0) / 100000).toFixed(1)}L
            </div>
            <div className="text-xs text-angelina-200">Total Value</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      {projects.length === 0 && !loading && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-angelina-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-angelina-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">1. Upload Documents</h4>
              <p className="text-sm text-gray-500">Upload 3D renders, 2D floor plans, elevations, or material sheets</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">2. AI Extracts BOQ</h4>
              <p className="text-sm text-gray-500">AI identifies rooms, materials, quantities, and calculates costs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">3. Review & Export</h4>
              <p className="text-sm text-gray-500">Edit, approve, and export as Excel or PDF for client sharing</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-angelina-600 text-white rounded-xl font-semibold hover:bg-angelina-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First BOQ Project
            </Link>
          </div>
        </div>
      )}

      {/* Project List */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-angelina-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-angelina-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-angelina-600" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-angelina-700 transition-colors">
                  {project.name}
                </h4>
                <p className="text-sm text-gray-500 mb-3">{project.client}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                  {project.total_estimate && (
                    <div className="flex items-center gap-1 font-medium text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      ₹{(project.total_estimate / 100000).toFixed(2)}L
                    </div>
                  )}
                  <ArrowRight className="w-3 h-3 group-hover:text-angelina-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
