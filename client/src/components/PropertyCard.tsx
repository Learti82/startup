import { Link } from 'react-router-dom';
import { MapPin, FileText, Calendar, ChevronRight } from 'lucide-react';
import RiskBadge from './RiskBadge';
import type { Property } from '../types';
import { t } from '../i18n';

interface Props {
  property: Property;
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  analyzing: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

const typeLabels: Record<string, string> = {
  apartment: 'Apartament',
  house: 'Shtëpi',
  land: 'Tokë',
  commercial: 'Tregtar',
};

export default function PropertyCard({ property }: Props) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base truncate">{property.title}</h3>
            {property.property_type && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {typeLabels[property.property_type] || property.property_type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[property.status] || statusColors.pending}`}>
              {t.status[property.status as keyof typeof t.status] || property.status}
            </span>
            {property.overall_status && (
              <RiskBadge level={property.overall_status} size="sm" />
            )}
            {property.overall_score !== undefined && property.overall_score !== null && (
              <span className="text-xs text-gray-500">
                Rezultati: <strong>{property.overall_score}/100</strong>
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {property.doc_count || 0} dokumente
        </span>
        {property.municipality && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {property.municipality}
          </span>
        )}
        {property.asking_price_eur && (
          <span className="font-medium text-gray-600">
            €{property.asking_price_eur.toLocaleString()}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(property.created_at).toLocaleDateString('sq-AL')}
        </span>
      </div>
    </Link>
  );
}
