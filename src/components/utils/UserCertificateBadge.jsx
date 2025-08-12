// UserCertificateBadge.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate } from '@fortawesome/free-solid-svg-icons';
import '../../styles/utils/UserCertificateBadge.scss';

function UserCertificateBadge({ user, badgeType, disableTooltip = false }) {
  if (!user && !badgeType) return null;

  let type = badgeType;

  if (user) {
    const { admin, verified, trusted } = user;
    if (admin) type = 'admin';
    else if (verified) type = 'verified';
    else if (trusted) type = 'trusted';
  }

  if (!type) return null;

  const tooltipText =
    type === 'admin'
      ? 'This user is a GSDB Admin'
      : type === 'verified'
        ? 'This user is verified by the GSDB administrators'
        : "This user's trust has been verified by the GSDB community";

  return (
    <span
      className={`certificate-badge ${type} ${disableTooltip ? 'no-tooltip' : ''}`}
      data-tooltip={disableTooltip ? '' : tooltipText}
    >
      <FontAwesomeIcon icon={faCertificate} color={
        type === 'admin' ? 'purple' :
          type === 'verified' ? 'royalblue' :
            'seagreen'
      } />
    </span>
  );
}

export default UserCertificateBadge;
