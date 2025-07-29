import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate } from '@fortawesome/free-solid-svg-icons';
import '../../styles/utils/UserCertificateBadge.scss';

function UserCertificateBadge({ user }) {
  if (!user) return null;

  const { admin, verified, trusted } = user;

  if (!admin && !verified && !trusted) {
    return null;
  }

  const badgeClass = admin
    ? 'admin'
    : verified
    ? 'verified'
    : 'trusted';

  const tooltipText = admin
    ? 'This user is a GSDB Admin'
    : verified
    ? 'This user is verified by the GSDB administrators'
    : 'This user\'s trust has been verified by the GSDB community';

  return (
    <span
      className={`certificate-badge ${badgeClass}`}
      data-tooltip={tooltipText}
    >
      <FontAwesomeIcon icon={faCertificate} />
    </span>
  );
}

export default UserCertificateBadge;
