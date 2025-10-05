"""
Background validation service for analyzed exoplanets.
Checks if analyzed exoplanets exist in the original dataset and saves new discoveries to bucket.
"""
import asyncio
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from io import BytesIO

from app.models.exoplanet import AnalyzedExoplanet
from app.db import supabase_client as sb


class ExoplanetValidationService:
    """
    Service for validating analyzed exoplanets against existing datasets
    """

    # Tolerance thresholds for matching
    COORDINATE_TOLERANCE = 0.01  # degrees (~36 arcseconds)
    PERIOD_TOLERANCE = 0.05  # 5% tolerance
    RADIUS_TOLERANCE = 0.1  # 10% tolerance

    def __init__(self):
        self.kepler_dataset: Optional[pd.DataFrame] = None
        self.tess_dataset: Optional[pd.DataFrame] = None

    async def load_datasets(self):
        """Load reference datasets for validation (lazy loading)"""
        # In production, these would be loaded from your data sources
        # For now, we'll use placeholders
        print("📚 Loading reference datasets for validation...")
        # Datasets should be loaded from CSV files or database
        # self.kepler_dataset = pd.read_csv('path/to/kepler_cumulative.csv')
        # self.tess_dataset = pd.read_csv('path/to/tess_toi.csv')

    def _is_coordinate_match(
        self,
        ra1: float,
        dec1: float,
        ra2: float,
        dec2: float,
        tolerance: float = None
    ) -> bool:
        """Check if two coordinate pairs match within tolerance"""
        if None in (ra1, dec1, ra2, dec2):
            return False

        tolerance = tolerance or self.COORDINATE_TOLERANCE
        ra_diff = abs(ra1 - ra2)
        dec_diff = abs(dec1 - dec2)

        # Account for RA wrapping at 360 degrees
        if ra_diff > 180:
            ra_diff = 360 - ra_diff

        return ra_diff < tolerance and dec_diff < tolerance

    def _is_orbital_period_match(
        self,
        period1: float,
        period2: float,
        tolerance: float = None
    ) -> bool:
        """Check if two orbital periods match within tolerance"""
        if None in (period1, period2):
            return False

        tolerance = tolerance or self.PERIOD_TOLERANCE
        relative_diff = abs(period1 - period2) / max(period1, period2)
        return relative_diff < tolerance

    def _is_radius_match(
        self,
        radius1: float,
        radius2: float,
        tolerance: float = None
    ) -> bool:
        """Check if two planetary radii match within tolerance"""
        if None in (radius1, radius2):
            return False

        tolerance = tolerance or self.RADIUS_TOLERANCE
        relative_diff = abs(radius1 - radius2) / max(radius1, radius2)
        return relative_diff < tolerance

    async def find_match_in_kepler(
        self,
        exoplanet: AnalyzedExoplanet
    ) -> Optional[Tuple[int, float]]:
        """
        Find matching exoplanet in Kepler dataset

        Returns:
            Tuple of (matched_id, confidence_score) or None
        """
        if self.kepler_dataset is None:
            await self.load_datasets()
            if self.kepler_dataset is None:
                return None

        # Try matching by KEPID first
        if exoplanet.kepid:
            match = self.kepler_dataset[
                self.kepler_dataset['kepid'] == exoplanet.kepid
            ]
            if not match.empty:
                return (int(match.iloc[0]['id']), 1.0)

        # Try matching by coordinates and orbital period
        matches = []
        for idx, row in self.kepler_dataset.iterrows():
            score = 0.0
            factors = 0

            # Check coordinate match
            if self._is_coordinate_match(exoplanet.ra, exoplanet.dec, row['ra'], row['dec']):
                score += 0.5
                factors += 1

            # Check orbital period match
            if self._is_orbital_period_match(exoplanet.koi_period, row.get('koi_period')):
                score += 0.3
                factors += 1

            # Check radius match
            if self._is_radius_match(exoplanet.koi_prad, row.get('koi_prad')):
                score += 0.2
                factors += 1

            if factors > 0:
                confidence = score / (factors * 0.33)  # Normalize to 0-1
                if confidence > 0.7:  # 70% confidence threshold
                    matches.append((int(row.get('id', idx)), confidence))

        if matches:
            # Return best match
            matches.sort(key=lambda x: x[1], reverse=True)
            return matches[0]

        return None

    async def find_match_in_tess(
        self,
        exoplanet: AnalyzedExoplanet
    ) -> Optional[Tuple[int, float]]:
        """
        Find matching exoplanet in TESS dataset

        Returns:
            Tuple of (matched_id, confidence_score) or None
        """
        if self.tess_dataset is None:
            await self.load_datasets()
            if self.tess_dataset is None:
                return None

        # Try matching by TIC ID or TOI first
        if exoplanet.tid:
            match = self.tess_dataset[
                self.tess_dataset['tid'] == exoplanet.tid
            ]
            if not match.empty:
                return (int(match.iloc[0].get('id', 0)), 1.0)

        if exoplanet.toi:
            match = self.tess_dataset[
                self.tess_dataset['toi'] == exoplanet.toi
            ]
            if not match.empty:
                return (int(match.iloc[0].get('id', 0)), 1.0)

        # Try matching by coordinates and orbital period
        matches = []
        for idx, row in self.tess_dataset.iterrows():
            score = 0.0
            factors = 0

            # Check coordinate match
            if self._is_coordinate_match(exoplanet.ra, exoplanet.dec, row['ra'], row['dec']):
                score += 0.5
                factors += 1

            # Check orbital period match
            if self._is_orbital_period_match(exoplanet.pl_orbper, row.get('pl_orbper')):
                score += 0.3
                factors += 1

            # Check radius match
            if self._is_radius_match(exoplanet.pl_rade, row.get('pl_rade')):
                score += 0.2
                factors += 1

            if factors > 0:
                confidence = score / (factors * 0.33)  # Normalize to 0-1
                if confidence > 0.7:  # 70% confidence threshold
                    matches.append((int(row.get('id', idx)), confidence))

        if matches:
            # Return best match
            matches.sort(key=lambda x: x[1], reverse=True)
            return matches[0]

        return None

    async def save_to_bucket(
        self,
        exoplanet: AnalyzedExoplanet,
        session: AsyncSession
    ) -> Optional[str]:
        """
        Save new exoplanet discovery to user_uploads bucket

        Returns:
            Bucket path if successful, None otherwise
        """
        try:
            # Create a dataframe with the exoplanet data
            data_dict = {}

            # Add all non-null fields
            if exoplanet.dataset_type == 'kepler':
                fields = [
                    'kepid', 'kepler_name', 'koi_disposition', 'koi_pdisposition',
                    'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co',
                    'koi_fpflag_ec', 'koi_period', 'koi_impact', 'koi_duration',
                    'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol', 'koi_model_snr',
                    'koi_tce_plnt_num', 'koi_steff', 'koi_slogg', 'koi_srad',
                    'koi_kepmag', 'ra', 'dec'
                ]
            else:  # tess
                fields = [
                    'toi', 'tid', 'tfopwg_disp', 'rastr', 'decstr', 'ra', 'dec',
                    'pl_orbper', 'pl_rade', 'pl_trandep', 'pl_trandurh', 'pl_eqt',
                    'pl_insol', 'st_rad', 'st_teff', 'st_logg', 'st_dist',
                    'st_pmra', 'st_pmdec', 'st_tmag'
                ]

            for field in fields:
                value = getattr(exoplanet, field, None)
                if value is not None:
                    data_dict[field] = [value]

            # Add prediction metadata
            data_dict['predicted_class'] = [exoplanet.predicted_class]
            data_dict['confidence_score'] = [exoplanet.confidence_score]
            data_dict['analyzed_at'] = [exoplanet.created_at.isoformat()]

            df = pd.DataFrame(data_dict)

            # Convert to CSV bytes
            buffer = BytesIO()
            df.to_csv(buffer, index=False)
            csv_bytes = buffer.getvalue()

            # Generate bucket path
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            name = exoplanet.kepler_name or exoplanet.toi or f"unknown_{exoplanet.id}"
            bucket_path = f"user_uploads/{exoplanet.dataset_type}/{timestamp}_{name}.csv"

            # Upload to bucket (use different bucket for user uploads)
            if sb.is_supabase_available():
                sb_client = sb.get_supabase()
                sb_client.storage.from_("user-uploads").upload(
                    bucket_path,
                    csv_bytes,
                    file_options={"content-type": "text/csv", "upsert": "true"}
                )

                # Update exoplanet record
                exoplanet.stored_in_bucket = True
                exoplanet.bucket_path = bucket_path
                await session.commit()

                print(f"✅ Saved new discovery to bucket: {bucket_path}")
                return bucket_path
            else:
                print("⚠️  Supabase not available - skipping bucket upload")
                return None

        except Exception as e:
            print(f"❌ Error saving to bucket: {str(e)}")
            return None

    async def validate_exoplanet(
        self,
        exoplanet: AnalyzedExoplanet,
        session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Validate a single exoplanet against existing datasets

        Returns:
            Validation result dictionary
        """
        result = {
            'id': exoplanet.id,
            'validation_status': 'pending',
            'is_new_discovery': False,
            'matched_with_id': None,
            'confidence_match': None,
            'bucket_path': None,
            'notes': None
        }

        try:
            # Find match based on dataset type
            if exoplanet.dataset_type == 'kepler':
                match = await self.find_match_in_kepler(exoplanet)
            else:  # tess
                match = await self.find_match_in_tess(exoplanet)

            if match:
                # Found existing exoplanet
                matched_id, confidence = match
                result['validation_status'] = 'matched'
                result['matched_with_id'] = matched_id
                result['confidence_match'] = confidence
                result['notes'] = f"Matched with {confidence*100:.1f}% confidence"

                exoplanet.validated = True
                exoplanet.validation_status = 'matched'
                exoplanet.matched_with_id = matched_id
                exoplanet.validated_at = datetime.utcnow()

            else:
                # Potential new discovery!
                result['validation_status'] = 'new_discovery'
                result['is_new_discovery'] = True
                result['notes'] = 'No match found in existing dataset - potential new discovery!'

                # Save to user_uploads bucket
                bucket_path = await self.save_to_bucket(exoplanet, session)
                result['bucket_path'] = bucket_path

                exoplanet.validated = True
                exoplanet.validation_status = 'new_discovery'
                exoplanet.validated_at = datetime.utcnow()

            await session.commit()
            return result

        except Exception as e:
            result['validation_status'] = 'error'
            result['notes'] = f"Validation error: {str(e)}"

            exoplanet.validation_status = 'error'
            await session.commit()

            return result

    async def validate_batch(
        self,
        job_id: str,
        session: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Validate all exoplanets from a job in the background

        Args:
            job_id: The job ID to validate
            session: Database session

        Returns:
            List of validation results
        """
        print(f"🔍 Starting background validation for job: {job_id}")

        # Get all unvalidated exoplanets for this job
        result = await session.execute(
            select(AnalyzedExoplanet).where(
                and_(
                    AnalyzedExoplanet.job_id == job_id,
                    AnalyzedExoplanet.validated == False
                )
            )
        )
        exoplanets = result.scalars().all()

        if not exoplanets:
            print(f"✅ No unvalidated exoplanets found for job {job_id}")
            return []

        print(f"📊 Validating {len(exoplanets)} exoplanets...")

        validation_results = []
        for exoplanet in exoplanets:
            result = await self.validate_exoplanet(exoplanet, session)
            validation_results.append(result)

            # Add small delay to avoid overwhelming the system
            await asyncio.sleep(0.1)

        # Summary
        new_discoveries = sum(1 for r in validation_results if r['is_new_discovery'])
        matched = sum(1 for r in validation_results if r['validation_status'] == 'matched')

        print(f"✅ Validation complete for job {job_id}:")
        print(f"   - {matched} matched with existing dataset")
        print(f"   - {new_discoveries} potential new discoveries")

        return validation_results


# Global instance
_validation_service = ExoplanetValidationService()


def get_validation_service() -> ExoplanetValidationService:
    """Get the global validation service instance"""
    return _validation_service
